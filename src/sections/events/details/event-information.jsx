import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Form, Field, Formik, ErrorMessage } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Card,
  Stack,
  Divider,
  CardHeader,
  Typography,
  CardContent,
  Chip,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  DialogActions,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/utils/axios';

const EventStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'ACTIVE':
      return {
        color: '#229A16',
        bgColor: '#E9FCD4',
        icon: 'eva:checkmark-circle-2-fill'
      };
    case 'INACTIVE':
      return {
        color: '#B72136',
        bgColor: '#FFE7D9',
        icon: 'ic:outline-block'
      };
    default:
      return {
        color: '#637381',
        bgColor: '#F4F6F8',
        icon: 'mdi:help-circle'
      };
  }
};

const EventInformation = ({ event }) => {
  const [countdown, setCountdown] = useState('');
  const [eventStatus, setEventStatus] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const calculateCountdown = () => {
      const eventDate = new Date(event.date);
      const now = new Date();
      const difference = eventDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown(`${days}D : ${hours}H : ${minutes}M : ${seconds}S`);
        setEventStatus(''); 
      } else {
        setCountdown('');
        setEventStatus('Event Ended');
      }
    };

    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  const items = [
    { title: 'Name', content: event.name },
    { title: 'Event Date', content: dayjs(event.date).format('LL') },
    { title: 'Person In charge', content: event.personInCharge.fullName },
    { title: 'Status', content: event.status },
  ];

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  return (
    <Card
      sx={{ 
        background: 'linear-gradient(to right, rgba(0, 0, 0, 1), rgba(226, 228, 230, 0.2) 400%)', 
        borderRadius: 2, 
        width: 1, 
        marginTop: 1.5,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        onClick={() => {
          setSelectedEvent(event);
          setOpenEdit(true);
        }}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: {
            xs: '25%', 
            sm: '15%', 
            md: '8%', 
          },
          height: '36px',
          backgroundColor: 'white',
          display: 'flex',
          gap: 0.5,
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomLeftRadius: 16,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        <Iconify 
          icon="eva:edit-fill" 
          width={14} 
          height={14} 
          sx={{ 
            color: 'grey.800',
            display: { xs: 'block', sm: 'block' }
          }} 
        />
        <Typography
          variant="caption"
          sx={{
            color: 'grey.800',
            fontWeight: 550,
            fontSize: {
              xs: '0.7rem',
              sm: '0.75rem',
              md: '0.8rem'
            }
          }}
        >
          Edit
        </Typography>
      </Box>

      <Divider />
      <CardContent>
        <Box display="flex" justifyContent="space-between" sx={{ p: 0.8 }}>
          <Box>
            <img src="/assets/nexea.png" alt="Nexea Logo" style={{ width: '90px', marginBottom: '8px' }} />
            <Typography variant="h6" sx={{ color: 'white', marginBottom: '14px' }}>{items[0].content}</Typography> 
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'normal' }}>{items[1].content}</Typography> 
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'normal' }}>{items[2].content}</Typography> 
          </Box>
          <Stack alignItems="center" justifyContent="center">
            <Chip
              icon={<Iconify icon={getStatusConfig(event.status).icon} width={16} height={16} />}
              label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              sx={{
                backgroundColor: getStatusConfig(event.status).bgColor,
                color: getStatusConfig(event.status).color,
                borderRadius: 2,
                height: 25, 
                paddingX: 2,
                justifyContent: 'center',
                '& .MuiChip-icon': { color: getStatusConfig(event.status).color },
                '&:hover': {
                  backgroundColor: getStatusConfig(event.status).bgColor,
                }
              }}
            />
            {eventStatus ? (
              <Typography variant="subtitle2" sx={{ color: 'red', fontWeight: 'bold', marginTop: 1 }}>
                {eventStatus}
              </Typography>
            ) : (
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', marginTop: 1 }}>
                {countdown}
              </Typography>
            )}
          </Stack>
        </Box>
      </CardContent>

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
            <Typography variant="h6">{selectedEvent?.name}</Typography>
            <Typography variant="subtitle1">Edit Information</Typography>
          </Box>
        </DialogTitle>
        <Divider sx={{ my: -1, mb: 2 }} />
        <DialogContent>
          <Formik
            initialValues={{
              name: selectedEvent?.name,
              description: selectedEvent?.description,
              date: selectedEvent?.date,
              personInCharge: selectedEvent?.personInCharge?.id,
              tickera_api: selectedEvent?.tickera_api,
              status: selectedEvent?.status,
            }}
            onSubmit={(values, { setSubmitting }) => {
              axiosInstance
                .put(`${endpoints.events.update}/${selectedEvent?.id}`, values)
                .then((response) => {
                  setSubmitting(false);
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
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
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

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="description"
                      label="Description"
                      multiline
                      rows={4}
                      fullWidth
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

                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Event Date"
                        value={dayjs(values.date)}
                        onChange={(newValue) => {
                          setFieldValue('date', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                    <ErrorMessage
                      name="date"
                      component="div"
                      style={{ color: 'red', fontSize: '0.8rem' }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel shrink htmlFor="personInCharge">
                        Person In Charge
                      </InputLabel>
                      <Field
                        as={Select}
                        name="personInCharge"
                        id="personInCharge"
                        label="Person In Charge"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      >
                        {/* Add your person in charge options here */}
                        <MenuItem value={1}>Person 1</MenuItem>
                        <MenuItem value={2}>Person 2</MenuItem>
                      </Field>
                      <ErrorMessage
                        name="personInCharge"
                        component="div"
                        style={{ color: 'red', fontSize: '0.8rem' }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      type="text"
                      name="tickera_api"
                      label="Tickera API"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <ErrorMessage
                      name="tickera_api"
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
    </Card>
  );
};

export default EventInformation;

EventInformation.propTypes = {
  event: PropTypes.object,
};
