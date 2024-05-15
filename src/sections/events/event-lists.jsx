/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/no-unresolved */

import dayjs from 'dayjs';
//  import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Field, Formik, ErrorMessage } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Pagination from '@mui/material/Pagination';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Grid,
  Card,
  Menu,
  Chip,
  Stack,
  Button,
  Dialog,
  Select,
  Avatar,
  Divider,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTheme } from '@mui/material/styles';
import { MuiFileInput } from 'mui-file-input';
import useUploadCSV from 'src/hooks/use-upload-csv';
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';

const EventStatus = {
  live: 'live',
  scheduled: 'scheduled',
  completed: 'completed',
  postponed: 'postponed',
};

// const TestCard = styled(Card)(({ theme }) => ({
//   position: 'relative',
//   overflow: 'visible', // Make sure the overflow is visible to show the blurred image
//   borderRadius: 8, // Adjust as per your preference
//   boxShadow: 'none', // You can add box-shadow if desired
//   backgroundBlendMode: 'overlay',
//   backgroundImage: 'url(https://api.slingacademy.com/public/sample-photos/1.jpeg)',
//   '&::before': {
//     content: '""',
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     top: 0,
//     left: 0,
//     backgroundImage: (props) => `url(${props.backgroundImage}`,
//     backgroundImage: 'url(https://api.slingacademy.com/public/sample-photos/1.jpeg)',
//     ilter: 'blur(10px)', // Adjust the blur intensity as needed
//     backgroundSize: 'cover',
//     backgroundRepeat: 'no-repeat',
//     zIndex: 1111, // Ensure the blurred background stays behind the content
//   },
// }));

const EventLists = () => {
  const theme = useTheme();
  const a = useAuthContext();
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataExists, setDataExist] = useState(false);
  const [users, setUsers] = useState([]); // State to store users data
  const [daysLeft, setDaysLeft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({});
  const navigate = useNavigate();
  const [openCSV, setOpenCSV] = useState(false);
  const [file, setFile] = React.useState(null);
  const { handleFileUpload } = useUploadCSV();

  const ITEMS_PER_PAGE = 6;

  const openn = Boolean(anchorEl);

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'primary.main';
      case 'completed':
        return 'grey.500';
      case 'scheduled':
        return 'primary.dark';
      case 'postponed':
        return 'red';
      default:
        return 'inherit';
    }
  };

  const handleClick = (event) => {
    const { id } = event.currentTarget;
    setCurrentEvent(events.find((elem) => elem.id === id));
    setAnchorEl(event.currentTarget);
  };
  const handleClosee = () => {
    setAnchorEl(null);
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(endpoints.events.list);
      setEvents(response.data.events);
      const eventsArray = response.data.events;
      if (eventsArray.length > 0) {
        setDataExist(true);
      } else {
        setDataExist(false);
      }

      setDaysLeft(
        eventsArray.map((event) => {
          const currentDate = new Date();
          const date = new Date(event.date);
          const formatDate = date.toLocaleDateString();
          const splitDate = formatDate.split('/');
          const eventDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
          const difference = eventDate.getTime() - currentDate.getTime();
          const days = Math.ceil(difference / (1000 * 3600 * 24));
          return days <= 0 ? '0' : days;
        })
      );

      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users data from an API
        const response = await axiosInstance.get(endpoints.users.list);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = (eventId) => {
    axiosInstance
      .delete(`${endpoints.events.delete}/${eventId}`)
      .then((response) => {
        fetchEvents(); // Refresh the events list after deletion
        toast.success('Event deleted successfully.');
      })
      .catch((error) => {
        toast.error(error?.message);
      });
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    handleClosee();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleChangeFile = (newFile) => {
    setFile(newFile);
  };

  const paginatedEvents = events.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {loading ? (
        <>
          <Skeleton variant="rounded" width="400px" height="400px" />
          <Skeleton variant="rounded" width="400px" height="400px" />
          <Skeleton variant="rounded" width="400px" height="400px" />
        </>
      ) : (
        <>
          {paginatedEvents && paginatedEvents.length === 0 ? (
            <Stack alignItems="center" gap={5} my={10}>
              <img src="/assets/empty.svg" alt="empty" width={300} />
              <Typography>No events to display.</Typography>
            </Stack>
          ) : (
            <Box
              display="grid"
              gap={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
              marginTop={5}
            >
              {paginatedEvents.map((event, index) => (
                <Card key={event.id}>
                  <IconButton
                    id={event.id}
                    onClick={handleClick}
                    aria-controls={openn ? event.id : undefined}
                    aria-expanded={openn ? 'true' : undefined}
                    aria-haspopup="true"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>

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
                        maxHeight: 200, // Set max height
                        width: 200, // Set width
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
                    {!currentEvent?.attendees?.length > 0 ? (
                      <MenuItem onClick={() => setOpenCSV(true)}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          gap={1}
                          color={theme.palette.success.main}
                        >
                          <Iconify icon="material-symbols:upload" />
                          <Typography variant="button">Upload CSV</Typography>
                        </Stack>
                      </MenuItem>
                    ) : (
                      <MenuItem disabled>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Iconify icon="material-symbols:upload" />
                          <Typography variant="button">Uploaded</Typography>
                        </Stack>
                      </MenuItem>
                    )}
                    {/* <MenuItem
                      onClick={() => navigate(`${paths.dashboard.events.qr}/${currentEvent.id}`)}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Iconify icon="bx:qr" />
                        <Typography variant="button">QR</Typography>
                      </Stack>
                    </MenuItem> */}
                    <MenuItem onClick={() => setOpenEdit(true)}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Iconify icon="material-symbols:edit" />
                        <Typography variant="button">Edit</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem
                      onClick={() => setOpenDelete(true)}
                      disabled={a.user.userType === 'normal'}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={1}
                        color={theme.palette.error.main}
                      >
                        <Iconify icon="material-symbols:delete" />
                        <Typography variant="button">Delete</Typography>
                      </Stack>
                    </MenuItem>
                  </Menu>

                  {/* Delete modal */}
                  <Dialog
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      Are you sure to delete this event ?
                    </DialogTitle>
                    <DialogActions>
                      <Button onClick={() => setOpenDelete(false)} color="error">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          // Delete function
                          handleDelete(event.id);
                          // Close the modal
                          setOpenDelete(false);
                          // Close the menu
                          handleClosee();
                        }}
                        autoFocus
                      >
                        Agree
                      </Button>
                    </DialogActions>
                  </Dialog>

                  {/* Edit modal */}
                  <Dialog
                    open={openEdit}
                    onClose={handleCloseEdit}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">Edit Information</DialogTitle>

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
                              fetchEvents();
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
                          <Form>
                            <Grid container spacing={2} py={2}>
                              <Grid item xs={6}>
                                <Field
                                  as={TextField}
                                  type="text"
                                  name="name"
                                  label="Event Name"
                                  fullWidth
                                  required
                                />
                                <ErrorMessage name="name" component="div" />
                              </Grid>

                              <Grid item xs={6}>
                                <Field
                                  as={Select}
                                  name="personInCharge"
                                  label="Person in Charge"
                                  fullWidth
                                  required
                                >
                                  {!dataExists ? (
                                    <MenuItem disabled>No data</MenuItem>
                                  ) : (
                                    users.map((user) => (
                                      <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                      </MenuItem>
                                    ))
                                  )}
                                </Field>
                                <ErrorMessage name="personInCharge" component="div" />
                              </Grid>

                              <Grid item xs={12}>
                                <Field
                                  as={TextField}
                                  type="text"
                                  name="description"
                                  label="Event Description"
                                  fullWidth
                                />
                                <ErrorMessage name="description" component="div" />
                              </Grid>

                              <Grid item xs={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    minDate={dayjs()}
                                    defaultValue={dayjs(currentEvent.date)}
                                    selected={values.date}
                                    onChange={(date) => setFieldValue('date', date)}
                                    className="form-control"
                                    required
                                    sx={{
                                      width: '100%',
                                    }}
                                  />
                                </LocalizationProvider>
                                <ErrorMessage name="date" component="div" />
                              </Grid>

                              <Grid item xs={6}>
                                <Field
                                  as={TextField}
                                  type="text"
                                  name="api"
                                  label="Tickera API"
                                  fullWidth
                                />
                                <ErrorMessage name="api" component="div" />
                              </Grid>

                              <Grid item xs={12} mb={3}>
                                <Field
                                  as={Select}
                                  name="status"
                                  label="Event Status"
                                  fullWidth
                                  required
                                >
                                  {Object.values(EventStatus).map((status) => (
                                    // <MenuItem key={status} value={status}>
                                    //   {updateStatus[index] && updateStatus[index].status}
                                    // </MenuItem>
                                    <MenuItem key={status} value={status}>
                                      {status}
                                    </MenuItem>
                                  ))}
                                </Field>
                                <ErrorMessage name="status" component="div" />
                              </Grid>

                              <Grid item xs={4}>
                                <Button onClick={handleCloseEdit} disabled={isSubmitting} fullWidth>
                                  Cancel
                                </Button>
                              </Grid>

                              <Grid item xs={8}>
                                <Button
                                  type="submit"
                                  variant="contained"
                                  color="primary"
                                  disabled={isSubmitting}
                                  fullWidth
                                >
                                  Confirm
                                </Button>
                              </Grid>
                            </Grid>
                          </Form>
                        )}
                      </Formik>
                    </DialogContent>
                  </Dialog>

                  {/* Upload CSV modal */}
                  <Dialog
                    open={openCSV}
                    onClose={() => setOpenCSV(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">Upload attendees</DialogTitle>
                    <DialogContent>
                      Please make sure the file are correct before uploads
                      <MuiFileInput
                        value={file}
                        onChange={handleChangeFile}
                        sx={{
                          marginTop: 5,
                        }}
                        fullWidth
                        size="medium"
                        variant="outlined"
                        InputProps={{
                          startAdornment: !file && (
                            <Stack direction="row" gap={2}>
                              <Iconify icon="material-symbols:upload" />
                              <Typography>Upload file</Typography>
                            </Stack>
                          ),
                        }}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => {
                          setOpenCSV(false);
                          setFile(null);
                          handleClosee();
                        }}
                        color="error"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          // Upload function
                          handleFileUpload(file, currentEvent.id);
                          // Close the modal
                          setOpenCSV(false);
                          // Close the menu
                          handleClosee();
                        }}
                        autoFocus
                      >
                        Upload
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Stack sx={{ p: 3, pb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Avatar
                        alt="test"
                        src="/logo/logo_single.svg"
                        variant="rounded"
                        sx={{ width: 48, height: 48, mb: 2 }}
                      />
                      {event.status === 'live' && (
                        <Chip
                          label={event.status}
                          color="error"
                          icon={<Iconify icon="svg-spinners:pulse" />}
                        />
                      )}
                    </Stack>

                    <ListItemText
                      sx={{ mb: 1 }}
                      primary={
                        <Typography fontWeight={900} variant="h4">
                          {event.name}
                        </Typography>
                      }
                      secondary={`Posted date: ${fDate(Date.now())}`}
                      primaryTypographyProps={{
                        typography: 'subtitle1',
                      }}
                      secondaryTypographyProps={{
                        mt: 1,
                        component: 'span',
                        typography: 'caption',
                        color: 'text.disabled',
                      }}
                    />

                    <Stack direction="row" justifyContent="space-between">
                      <Stack
                        spacing={0.5}
                        direction="row"
                        alignItems="center"
                        sx={{ color: 'primary.main', typography: 'caption' }}
                      >
                        <Iconify width={16} icon="solar:users-group-rounded-bold" />
                        {event?.attendees.length} Attendees
                      </Stack>
                      <Stack
                        spacing={0.5}
                        direction="row"
                        alignItems="center"
                        sx={{ color: 'primary.main', typography: 'caption' }}
                      >
                        <Iconify width={16} icon="oui:check-in-circle-filled" />
                        {`${event?.attendees.map((e) => e.checkedIn).filter((e) => e === 'Yes').length
                          } of ${event?.attendees.length} checked in`}
                      </Stack>
                    </Stack>
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  <Box
                    rowGap={1.5}
                    display="grid"
                    gridTemplateColumns="repeat(2, 1fr)"
                    sx={{ p: 3 }}
                  >
                    <Stack
                      spacing={0.5}
                      flexShrink={0}
                      direction="row"
                      alignItems="center"
                      sx={{ color: 'text.disabled', minWidth: 0 }}
                    >
                      <Iconify icon="mdi:user" />
                      <Typography variant="caption" noWrap>
                        {`${event.personInCharge.name
                          .charAt(0)
                          .toUpperCase()}${event?.personInCharge?.name.slice(1)}`}
                      </Typography>
                    </Stack>
                    <Stack
                      spacing={0.5}
                      flexShrink={0}
                      direction="row"
                      alignItems="center"
                      sx={{ color: 'text.disabled', minWidth: 0 }}
                    >
                      <Iconify icon="mdi:alarm" />
                      <Typography variant="caption" noWrap>
                        {daysLeft[index]} days
                      </Typography>
                    </Stack>
                    <Stack
                      spacing={0.5}
                      flexShrink={0}
                      direction="row"
                      alignItems="center"
                      sx={{ color: 'text.disabled', minWidth: 0 }}
                    >
                      <Iconify icon="mdi:calendar" />
                      <Typography variant="caption" noWrap>
                        {dayjs(event.date).format('DD-MMM-YYYY')}
                      </Typography>
                    </Stack>

                    <Stack
                      spacing={0.5}
                      direction="row"
                      alignItems="center"
                      sx={{
                        color: getStatusColor(event.status),
                        typography: 'caption',
                      }}
                    >
                      <Iconify width={16} icon="grommet-icons:status-good-small" />
                      {/* {updateStatus[index] && updateStatus[index].status} */}
                      {event.status}
                    </Stack>
                  </Box>

                  <Stack direction="row" alignItems="center" justifyContent="stretch" gap={3} p={2}>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<Iconify icon="bx:qr" />}
                      fullWidth
                      onClick={() => navigate(`${paths.dashboard.events.qr}/${event.id}`)}
                    >
                      QR
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<Iconify icon="mdi:users" />}
                      fullWidth
                      onClick={() => navigate(`${paths.dashboard.events.attendees}/${event.id}`)}
                    >
                      Attendees
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {events.length > ITEMS_PER_PAGE && (
        <Pagination
          count={Math.ceil(events.length / ITEMS_PER_PAGE)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            mt: 8,
            justifyContent: 'center',
          }}
        />
      )}
    </>
  );
};

export default EventLists;
// TestCard.propTypes = {
//   backgroundImage: PropTypes.string.isRequired,
// };
