/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/no-unresolved */

import dayjs from 'dayjs';
//  import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import React, { useMemo, useState } from 'react';
import { Form, Field, Formik, ErrorMessage } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Pagination from '@mui/material/Pagination';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Grid,
  Menu,
  Chip,
  Stack,
  Table,
  Paper,
  Button,
  Dialog,
  Select,
  Avatar,
  Divider,
  TableRow,
  MenuItem,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  useMediaQuery,
  TableContainer,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import { endpoints, axiosInstance } from 'src/utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTheme } from '@mui/material/styles';
import useUploadCSV from 'src/hooks/use-upload-csv';
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';
import PropTypes from 'prop-types';
import { useGetAllEvents } from 'src/api/event';
import { enqueueSnackbar } from 'notistack';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { TableNoData } from 'src/components/table';
import EventTicketDialog from './dialog/event-ticket-dialog';

const EventStatus = {
  live: 'live',
  scheduled: 'scheduled',
  completed: 'completed',
  postponed: 'postponed',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'mdi:play-circle';
    case 'INACTIVE':
      return 'ic:outline-block';
    default:
      return 'mdi:help-circle';
  }
};

const EventLists = ({ query }) => {
  const theme = useTheme();

  const a = useAuthContext();

  const { data, isLoading, error: errorEvents } = useGetAllEvents();

  const notFound = !data?.events?.length;

  const [currentPage, setCurrentPage] = useState(1);

  const [anchorEl, setAnchorEl] = useState();

  const [openEdit, setOpenEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [openWhatsapp, setOpenWhatsapp] = useState(false);

  const [currentEvent, setCurrentEvent] = useState({});

  const navigate = useNavigate();

  const [openCSV, setOpenCSV] = useState(false);

  const [file, setFile] = React.useState(null);

  const { handleFileUpload } = useUploadCSV();

  const [anchorEl2, setAnchorEl2] = useState();

  const [currentEventId, setCurrentEventId] = useState('');

  const [anchorElFilter, setAnchorElFilter] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [openCreateTicket, setOpenCreateTicket] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const ticketDialog = useBoolean();

  const router = useRouter();

  const ITEMS_PER_PAGE = 6;

  const openn = Boolean(anchorEl);

  const handleClosee = () => {
    setAnchorEl(null);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    handleClosee();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const paginatedEvents = useMemo(() => {
    if (query) {
      return data?.events
        .filter((event) => event.name.toLowerCase().includes(query.toLowerCase()))
        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }
    return data?.events.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [data, query, currentPage]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const filteredEvents = useMemo(() => {
    if (statusFilter) {
      return data?.events?.filter((event) => event.status === statusFilter);
    }
    return data?.events || [];
  }, [statusFilter, data]);

  const openModal = (dialog) => {
    if (dialog) {
      dialog.onTrue();
    }
  };

  if (isLoading)
    return (
      <Stack direction="row" mt={2} gap={2} flexWrap="wrap">
        <Skeleton variant="rounded" width="400px" height="400px" />
        <Skeleton variant="rounded" width="400px" height="400px" />
        <Skeleton variant="rounded" width="400px" height="400px" />
      </Stack>
    );

  if (errorEvents)
    enqueueSnackbar(errorEvents?.message, {
      variant: 'error',
    });

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table sx={{ minWidth: 650 }} aria-label="events table" size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={{ fontWeight: 'bold', paddingLeft: 3 }}>
                Event Name
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Person in Charge
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Posted Date
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
                <Stack direction="row" alignItems="center" spacing={-1}>
                  Status
                  <IconButton onClick={(e) => setAnchorElFilter(e.currentTarget)}>
                    <Iconify icon="mdi:filter" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorElFilter}
                    open={Boolean(anchorElFilter)}
                    onClose={() => setAnchorElFilter(null)}
                  >
                    {Object.values(EventStatus).map((status) => (
                      <MenuItem key={status} onClick={() => handleStatusFilterChange(status)}>
                        <Stack direction="row" alignItems="center">
                          {status === statusFilter && (
                            <Iconify icon="mdi:check" sx={{ marginRight: 1, color: 'green' }} />
                          )}
                          <Typography variant="body2">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                    <MenuItem onClick={() => handleStatusFilterChange('')}>
                      <Stack direction="row" alignItems="center">
                        {statusFilter === '' && (
                          <Iconify icon="mdi:check" sx={{ marginRight: 1, color: 'green' }} />
                        )}
                        All
                      </Stack>
                    </MenuItem>
                  </Menu>
                </Stack>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.length === 0 && statusFilter ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Stack alignItems="center" gap={5} my={10}>
                    <img src="/assets/empty.svg" alt="empty" width={300} />
                    <Typography>
                      No events available for the status:{' '}
                      {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar alt="Event" src="/logo/nexea.png" sx={{ width: 40, height: 40 }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {event.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">{event.personInCharge.fullName}</TableCell>
                  <TableCell align="center">{fDate(Date.now())}</TableCell>
                  <TableCell align="center" sx={{ paddingLeft: 5 }}>
                    <Chip
                      label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      color={getStatusColor(event.status)}
                      icon={
                        <Iconify icon={getStatusIcon(event.status)} sx={{ marginRight: 0.5 }} />
                      }
                      sx={{
                        width: '120px',
                        height: '30px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="end">
                    <Stack direction="row" spacing={1} sx={{ marginLeft: 'auto' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Iconify icon="bx:qr" />}
                        onClick={() => navigate(`${paths.dashboard.events.qr}/${event.id}`)}
                      >
                        {!isSmallScreen && 'QR'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          setAnchorEl2(e.currentTarget);
                          setCurrentEventId(event.id);
                        }}
                        endIcon={<Iconify icon="raphael:arrowdown" width={14} />}
                      >
                        <Iconify icon="mdi:users" />
                      </Button>
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedEvent(event);
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                      <Menu
                        id={event.id}
                        MenuListProps={{
                          'aria-labelledby': event.id,
                        }}
                        anchorEl={anchorEl2}
                        open={Boolean(anchorEl2)}
                        onClose={() => {
                          setAnchorEl2(null);
                        }}
                        sx={{
                          '& .MuiMenu-paper': {
                            maxHeight: 200,
                            width: 200,
                            mt: 1.5,
                          },
                          '& .MuiPaper-root': {
                            boxShadow:
                              '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
                          },
                        }}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <MenuItem
                          onClick={() =>
                            navigate(`${paths.dashboard.events.attendees}/${currentEventId}`)
                          }
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Iconify icon="mdi:users" />
                            <Typography variant="button">Attendee List</Typography>
                          </Stack>
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            navigate(`${paths.dashboard.events.notification(currentEventId)}`)
                          }
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Iconify icon="lets-icons:status" />
                            <Typography variant="button">Notification Status</Typography>
                          </Stack>
                        </MenuItem>
                      </Menu>
                      <Menu
                        id={event.id}
                        MenuListProps={{
                          'aria-labelledby': event.id,
                        }}
                        anchorEl={anchorEl}
                        open={openn}
                        onClose={handleClosee}
                        sx={{
                          '& .MuiMenu-paper': {
                            maxHeight: 200,
                            width: 250,
                            mt: 1.5,
                          },
                          '& .MuiPaper-root': {
                            boxShadow:
                              '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
                          },
                        }}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <MenuItem
                          onClick={() =>
                            router.push(paths.dashboard.events.details(selectedEvent.id))
                          }
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Iconify icon="bxs:detail" />
                            <Typography variant="button">Details</Typography>
                          </Stack>
                        </MenuItem>
                        <MenuItem onClick={() => setOpenEdit(true)}>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Iconify icon="material-symbols:edit" />
                            <Typography variant="button">Edit Event</Typography>
                          </Stack>
                        </MenuItem>
                        <MenuItem onClick={() => openModal(ticketDialog)}>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Iconify icon="mdi:ticket" />
                            <Typography variant="button">Tickets</Typography>
                          </Stack>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setCurrentEvent(event);
                            setOpenDelete(true);
                          }}
                          disabled={a.user.userType === 'normal'}
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Iconify icon="material-symbols:delete" sx={{ color: 'red' }} />
                            <Typography variant="button" sx={{ color: 'red' }}>
                              Delete
                            </Typography>
                          </Stack>
                        </MenuItem>
                      </Menu>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        const b = document.createElement('a');
                        b.href = `http://localhost:81/event/${event.id}`;
                        b.target = '_blank';
                        document.body.appendChild(b);
                        b.click();
                        document.body.removeChild(b);
                      }}
                    >
                      Cart View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}

            <TableNoData notFound={notFound} />
          </TableBody>
        </Table>
      </TableContainer>

      {!!data && data.events.length > ITEMS_PER_PAGE && (
        <Pagination
          count={Math.ceil(data.events.length / ITEMS_PER_PAGE)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            mt: 8,
            justifyContent: 'center',
          }}
        />
      )}

      {/* Delete modal */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ mb: 1, mt: 3 }}>
          <Box
            sx={{
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Iconify icon="mdi:alert" color="red" width={30} />
          </Box>
        </Box>
        <DialogTitle
          id="alert-dialog-title"
          sx={{ textAlign: 'center', fontSize: '1.75rem', mb: -2, mt: -2 }}
        >
          Delete Event
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center" sx={{ fontSize: '1rem' }}>
            Are you sure you want to delete this event? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            onClick={() => setOpenDelete(false)}
            sx={{
              borderRadius: 6,
              backgroundColor: '#f0f0f0',
              color: '#555',
              flex: 1,
              height: '48px',
              '&:hover': {
                backgroundColor: '#d0d0d0',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // handleDelete(currentEvent.id);
              setOpenDelete(false);
              handleClosee();
            }}
            autoFocus
            sx={{
              borderRadius: 6,
              color: 'white',
              backgroundColor: 'red',
              flex: 1,
              height: '48px',
              '&:hover': {
                backgroundColor: '#c62828',
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Whatsapp */}
      <Dialog
        open={openWhatsapp}
        onClose={() => setOpenWhatsapp(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Edit Whatsapp</DialogTitle>

        <DialogContent>
          <Formik
            initialValues={{
              name: currentEvent?.name,
              description: currentEvent?.description,
              date: currentEvent?.date,
              personInCharge: currentEvent?.personInCharge?.id,
              tickera_api: currentEvent?.tickera_api,
              status: currentEvent?.status,
            }}
            onSubmit={(values, { setSubmitting }) => {
              axiosInstance
                .put(`${endpoints.events.update}/${currentEvent?.id}`, values)
                .then((response) => {
                  setSubmitting(false);
                  // fetchEvents();
                  toast.success('Event updated successfully.');
                })
                .catch((error) => {
                  console.error('Error updating event:', error);
                  setSubmitting(false);
                  toast.error('Update Failed, Try again!');
                });
              handleCloseEdit();
            }}
          >
            {({ isSubmitting, setFieldValue, values }) => <Form />}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Edit Information Modal */}
      <Dialog
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt="Event"
            src="/logo/nexea.png"
            sx={{ width: 64, height: 64, marginRight: 2 }}
          />
          <Box>
            <Typography variant="h6">{currentEvent.name}</Typography>
            <Typography variant="subtitle1">Edit Information</Typography>
          </Box>
        </DialogTitle>
        <Divider sx={{ my: -1, mb: 2 }} />
        <DialogContent>
          <Formik
            initialValues={{
              name: currentEvent?.name,
              description: currentEvent?.description,
              date: currentEvent?.date,
              personInCharge: currentEvent?.personInCharge?.id,
              tickera_api: currentEvent?.tickera_api,
              status: currentEvent?.status,
            }}
            onSubmit={(values, { setSubmitting }) => {
              axiosInstance
                .put(`${endpoints.events.update}/${currentEvent?.id}`, values)
                .then((response) => {
                  setSubmitting(false);
                  // fetchEvents();
                  toast.success('Event updated successfully.');
                })
                .catch((error) => {
                  console.error('Error updating event:', error);
                  setSubmitting(false);
                  toast.error('Update Failed, Try again!');
                });
              handleCloseEdit();
            }}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      type="text"
                      name="name"
                      label="Event Name"
                      fullWidth
                      required
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      style={{ color: 'red', fontSize: '0.8rem' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={Select}
                      name="personInCharge"
                      label="Person in Charge"
                      fullWidth
                      required
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      {/* {!dataExists ? (
                        <MenuItem disabled>No data</MenuItem>
                      ) : (
                        users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))
                      )} */}
                    </Field>
                    <ErrorMessage
                      name="personInCharge"
                      component="div"
                      style={{ color: 'red', fontSize: '0.8rem' }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      type="text"
                      name="description"
                      label="Event Description"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      style={{ color: 'red', fontSize: '0.8rem' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Event Date"
                        minDate={dayjs()}
                        value={dayjs(values.date)}
                        onChange={(date) => setFieldValue('date', date.toISOString())}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth variant="outlined" />
                        )}
                        required
                      />
                    </LocalizationProvider>
                    <ErrorMessage
                      name="date"
                      component="div"
                      style={{ color: 'red', fontSize: '0.8rem' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      type="text"
                      name="api"
                      label="Tickera API"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <ErrorMessage
                      name="api"
                      component="div"
                      style={{ color: 'red', fontSize: '0.8rem' }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel shrink htmlFor="status">
                        Event Status
                      </InputLabel>
                      <Field
                        as={Select}
                        name="status"
                        id="status"
                        label="Event Status"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      >
                        {Object.values(EventStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </MenuItem>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="status"
                        component="div"
                        style={{ color: 'red', fontSize: '0.8rem' }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        onClick={handleCloseEdit}
                        disabled={isSubmitting}
                        variant="contained"
                        sx={{
                          borderRadius: 6,
                          backgroundColor: '#f0f0f0',
                          height: '36px',
                          padding: '0 16px',
                          color: '#555',
                          '&:hover': {
                            backgroundColor: '#d0d0d0',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        sx={{
                          borderRadius: 6,
                          color: 'white',
                          height: '36px',
                          padding: '0 16px',
                          backgroundColor: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#115293',
                          },
                        }}
                      >
                        Update Event
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Modal */}
      <Dialog
        open={openCSV}
        onClose={() => setOpenCSV(false)}
        aria-labelledby="upload-dialog-title"
        aria-describedby="upload-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="upload-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt="Event"
            src="/logo/nexea.png"
            sx={{ width: 64, height: 64, marginRight: 2 }}
          />
          <Box>
            <Typography variant="h6">{currentEvent.name}</Typography>
            <Typography variant="subtitle1">Upload Attendees</Typography>
          </Box>
        </DialogTitle>
        <Divider sx={{ my: -1, mb: 3 }} />
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'flex-start' }}>
            Upload a CSV file of the attendees.
          </Typography>
          {file ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 2, border: '1px solid #ccc', padding: 1, borderRadius: 1 }}
            >
              <Iconify icon="mdi:file-csv" />
              <Typography variant="body2">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
              <IconButton
                onClick={() => {
                  setFile(null);
                }}
                color="error"
                size="small"
                sx={{ marginLeft: 'auto' }}
              >
                <Iconify icon="mdi:close-circle" />
              </IconButton>
            </Stack>
          ) : (
            <Button
              variant="contained"
              component="label"
              sx={{
                marginTop: 2,
                backgroundColor: '#3874cb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 1,
                height: '40px',
                '&:hover': {
                  backgroundColor: '#2e5a9b',
                },
              }}
            >
              <Iconify icon="material-symbols:upload" sx={{ marginRight: 1 }} />
              Choose File (.csv)
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(event) => {
                  const selectedFile = event.target.files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                  }
                }}
              />
            </Button>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => {
              setOpenCSV(false);
              setFile(null);
              handleClosee();
            }}
            sx={{
              borderRadius: 6,
              backgroundColor: '#f0f0f0',
              height: '36px',
              padding: '0 16px',
              color: '#555',
              '&:hover': {
                backgroundColor: '#d0d0d0',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleFileUpload(file, currentEvent.id);
              setOpenCSV(false);
              handleClosee();
            }}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 6,
              color: 'white',
              height: '36px',
              padding: '0 16px',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
            }}
            disabled={!file}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <EventTicketDialog
        open={ticketDialog.value}
        onClose={ticketDialog.onFalse}
        tickets={selectedEvent?.ticketType}
        event={selectedEvent}
      />

      {/* Create New Ticket Modal */}
      <Dialog
        open={openCreateTicket}
        onClose={() => setOpenCreateTicket(false)}
        aria-labelledby="create-ticket-dialog-title"
        aria-describedby="create-ticket-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="create-ticket-dialog-title">Create New Ticket</DialogTitle>
        <Divider sx={{ my: -1, mb: 2 }} />
        <DialogContent>
          <Formik
            initialValues={{
              name: '',
              type: '',
              validity: '',
              category: '',
              price: '',
              quantity: '',
            }}
            // onSubmit={handleCreateTicket}
          >
            {({ handleChange, handleSubmit, setFieldValue, values }) => (
              <Form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Field as={TextField} name="name" label="Ticket Name" fullWidth required />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel id="ticket-type-label">Ticket Type</InputLabel>
                      <Field
                        as={Select}
                        name="type"
                        labelId="ticket-type-label"
                        label="Ticket Type"
                        onChange={(event) => setFieldValue('type', event.target.value)}
                      >
                        <MenuItem value="Early Bird">Early Bird</MenuItem>
                        <MenuItem value="Standard">Standard</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="validity"
                      label="Ticket Validity"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel id="ticket-category-label">Ticket Category</InputLabel>
                      <Field
                        as={Select}
                        name="category"
                        labelId="ticket-category-label"
                        label="Ticket Category"
                        onChange={(event) => setFieldValue('category', event.target.value)}
                      >
                        <MenuItem value="Startup">Startup</MenuItem>
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Speaker">Speaker</MenuItem>
                        <MenuItem value="VIP">VIP</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="price"
                      label="Ticket Price"
                      type="number"
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="quantity"
                      label="Ticket Quantity"
                      type="number"
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DialogActions sx={{ justifyContent: 'flex-end', paddingRight: '-0px' }}>
                      <Button
                        onClick={() => setOpenCreateTicket(false)}
                        sx={{
                          borderRadius: 6,
                          backgroundColor: '#f0f0f0',
                          height: '36px',
                          padding: '0 16px',
                          color: '#555',
                          '&:hover': {
                            backgroundColor: '#d0d0d0',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        sx={{
                          borderRadius: 6,
                          color: 'white',
                          height: '36px',
                          padding: '0 16px',
                          backgroundColor: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#115293',
                          },
                        }}
                      >
                        Create Ticket
                      </Button>
                    </DialogActions>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Modal */}
      {/* <Dialog
        open={openEditTicket}
        onClose={() => setOpenEditTicket(false)}
        aria-labelledby="edit-ticket-dialog-title"
        aria-describedby="edit-ticket-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="edit-ticket-dialog-title">Edit Ticket</DialogTitle>
        <Divider sx={{ my: -1, mb: 2 }} />
        <DialogContent>
          {currentTicket && (
            <Formik
              initialValues={{
                name: currentTicket.name,
                type: currentTicket.type,
                validity: currentTicket.validity,
                category: currentTicket.category,
                price: currentTicket.price,
                quantity: currentTicket.quantity,
              }}
              // onSubmit={handleEditTicket}
            >
              {({ handleChange, handleSubmit, setFieldValue }) => (
                <Form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Field as={TextField} name="name" label="Ticket Name" fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required variant="outlined">
                        <InputLabel id="edit-ticket-type-label">Ticket Type</InputLabel>
                        <Field
                          as={Select}
                          name="type"
                          labelId="edit-ticket-type-label"
                          label="Ticket Type"
                          onChange={(event) => setFieldValue('type', event.target.value)}
                        >
                          <MenuItem value="Early Bird">Early Bird</MenuItem>
                          <MenuItem value="Standard">Standard</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="validity"
                        label="Ticket Validity"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required variant="outlined">
                        <InputLabel id="edit-ticket-category-label">Ticket Category</InputLabel>
                        <Field
                          as={Select}
                          name="category"
                          labelId="edit-ticket-category-label"
                          label="Ticket Category"
                          onChange={(event) => setFieldValue('category', event.target.value)}
                        >
                          <MenuItem value="Startup">Startup</MenuItem>
                          <MenuItem value="General">General</MenuItem>
                          <MenuItem value="Speaker">Speaker</MenuItem>
                          <MenuItem value="VIP">VIP</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="price"
                        label="Ticket Price"
                        type="number"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="quantity"
                        label="Ticket Quantity"
                        type="number"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <DialogActions sx={{ justifyContent: 'flex-end' }}>
                        <Button onClick={() => setOpenEditTicket(false)} color="primary">
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{ marginLeft: 1 }}
                        >
                          Update Ticket
                        </Button>
                      </DialogActions>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog> */}

      {/* Delete Ticket Modal */}
      {/* <Dialog
        open={openDeleteTicket}
        onClose={() => setOpenDeleteTicket(false)}
        aria-labelledby="delete-ticket-dialog-title"
        aria-describedby="delete-ticket-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ mb: 1, mt: 3 }}>
          <Box
            sx={{
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Iconify icon="mdi:trash-can" color="red" width={30} />
          </Box>
        </Box>
        <DialogTitle
          id="delete-ticket-dialog-title"
          sx={{ textAlign: 'center', fontSize: '1.75rem', mb: -2, mt: -2 }}
        >
          Delete Ticket
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center" sx={{ fontSize: '1rem' }}>
            Are you sure you want to delete this ticket? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            onClick={() => setOpenDeleteTicket(false)}
            sx={{
              borderRadius: 6,
              backgroundColor: '#f0f0f0',
              color: '#555',
              flex: 1,
              height: '48px',
              '&:hover': {
                backgroundColor: '#d0d0d0',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // handleDeleteTicket(currentTicket.id);
              setOpenDeleteTicket(false);
            }}
            autoFocus
            sx={{
              borderRadius: 6,
              color: 'white',
              backgroundColor: 'red',
              flex: 1,
              height: '48px',
              '&:hover': {
                backgroundColor: '#c62828',
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default EventLists;

EventLists.propTypes = {
  query: PropTypes.string,
};
