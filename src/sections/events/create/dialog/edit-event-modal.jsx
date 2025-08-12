import useSWR from 'swr';
import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { MuiColorInput } from 'mui-color-input';
import { Form, Field, Formik, ErrorMessage } from 'formik';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Grid,
  Stack,
  Avatar,
  Button,
  Dialog,
  Select,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  FormControl,
  DialogContent,
  FormHelperText,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { endpoints, axiosInstance } from 'src/utils/axios';

import { Upload } from 'src/components/upload';

// Event Status options
const EventStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

// Fetcher function for the SWR hook
const fetcher = async (url) => {
  const response = await axiosInstance.get(url);
  return response.data;
};

const EditEventModal = ({ open, onClose, selectedEvent, onEventUpdated }) => {
  const { data: usersData, isLoading: loadingUsers } = useSWR(
    open ? endpoints.users.list : null,
    fetcher
  );

  const smUp = useResponsive('up', 'sm');

  // Function to check if form values have changed from initial values
  const hasFormChanged = (currentValues, initialValues) =>
    Object.keys(initialValues).some((key) => currentValues[key] !== initialValues[key]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="edit-event-dialog-title"
      aria-describedby="edit-event-dialog-description"
      maxWidth="md"
      fullWidth
      fullScreen={!smUp}
      PaperProps={{
        elevation: 0,
        sx: {
          ...(smUp && {
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }),
          background: (theme) => theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        id="edit-event-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 3,
          px: 3,
        }}
      >
        <Avatar
          alt="Event"
          src={selectedEvent?.eventSetting?.eventLogo || '/logo/nexea.png'}
          sx={{
            width: 48,
            height: 48,
            marginRight: 2,
            border: (theme) => `3px solid ${theme.palette.background.paper}`,
            backgroundColor: selectedEvent?.eventSetting?.bgColor || '#f0f4f8',
            '& img': {
              objectFit: 'contain',
              width: '70%',
              height: '70%',
              margin: 'auto',
            },
          }}
        />
        <Box>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{
              letterSpacing: '-0.2px',
              mb: 0.5,
            }}
          >
            {selectedEvent?.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.85rem',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#34c759',
                display: 'inline-block',
                mr: 1,
              }}
            />
            Edit Event Details
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Formik
          initialValues={{
            name: selectedEvent?.name,
            description: selectedEvent?.description,
            eventVenue: selectedEvent?.eventVenue || '',
            date: dayjs(selectedEvent?.date).format('YYYY-MM-DD'), // Keep only the date part
            endDate: dayjs(selectedEvent?.endDate).format('YYYY-MM-DD'),
            time: selectedEvent?.date ? dayjs(selectedEvent.date) : null,
            endTime: selectedEvent?.endDate ? dayjs(selectedEvent.endDate) : null,
            personInCharge: selectedEvent?.personInCharge?.id,
            sst: selectedEvent?.eventSetting?.sst,
            status: selectedEvent?.status,
            eventLogo: selectedEvent?.eventSetting?.eventLogo,
            bgColor: selectedEvent?.eventSetting?.bgColor || '#f0f4f8',
          }}
          onSubmit={(values, { setSubmitting }) => {
            // Get date parts from date objects
            const startDate = dayjs(values.date).format('YYYY-MM-DD');
            const endDate = dayjs(values.endDate).format('YYYY-MM-DD');

            // Get time parts using 24-hour format (HH:mm)
            const startTime = dayjs(values.time).format('HH:mm');
            const endTime = dayjs(values.endTime).format('HH:mm');

            console.log('Edit time values:', {
              startTime: `${dayjs(values.time).format('hh:mm A')} -> ${startTime}`,
              endTime: `${dayjs(values.endTime).format('hh:mm A')} -> ${endTime}`,
            });

            // Format the date-time strings in ISO-like format
            const combinedDateTime = `${startDate}T${startTime}`;
            const combinedEndDateTime = `${endDate}T${endTime}`;

            console.log('Edit formatted dates:', {
              startDateTime: combinedDateTime,
              endDateTime: combinedEndDateTime,
            });

            const dataToSend = {
              ...values,
              date: combinedDateTime,
              endDate: combinedEndDateTime,
            };

            // Remove time fields not expected by backend
            delete dataToSend.time;
            delete dataToSend.endTime;
            // Create a new FormData object - this was missing
            const formData = new FormData();

            // Add the file if it exists and is not a string (URL)
            if (values.eventLogo && typeof values.eventLogo !== 'string') {
              formData.append('eventLogo', values.eventLogo);
            }
            // Continue with your existing form submission
            formData.append('data', JSON.stringify(dataToSend));

            axiosInstance
              .put(`${endpoints.events.update}/${selectedEvent?.id}`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              })
              .then((response) => {
                setSubmitting(false);
                toast.success('Event updated successfully.');
                if (onEventUpdated) {
                  onEventUpdated(response.data);
                }
                onClose();
              })
              .catch((error) => {
                console.error('Error updating event:', error);
                setSubmitting(false);
                toast.error('Update Failed, Try again!');
              });
          }}
        >
          {({ isSubmitting, setFieldValue, values, initialValues }) => {
            // Check if form values have changed
            const formHasChanged = hasFormChanged(values, initialValues);

            return (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography
                      component="label"
                      htmlFor="name"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Event Name{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <Field
                      as={TextField}
                      name="name"
                      id="name"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="Enter event name"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          '& .MuiInputBase-input': {
                            padding: '12px 16px',
                          },
                        },
                      }}
                    />
                    <ErrorMessage
                      name="name"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      component="label"
                      htmlFor="description"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Description
                    </Typography>
                    <Field
                      as={TextField}
                      name="description"
                      id="description"
                      multiline
                      rows={3}
                      fullWidth
                      variant="outlined"
                      placeholder="Enter event description"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                    <ErrorMessage
                      name="description"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      component="label"
                      htmlFor="eventVenue"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Event Venue{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <Field
                      as={TextField}
                      name="eventVenue"
                      id="eventVenue"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="Enter event venue"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          '& .MuiInputBase-input': {
                            padding: '12px 16px',
                          },
                        },
                      }}
                    />
                    <ErrorMessage
                      name="eventVenue"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="date"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Event Date{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={dayjs(values.date)}
                        onChange={(newValue) => {
                          setFieldValue('date', newValue);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            id: 'date',
                            placeholder: 'Select date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <ErrorMessage
                      name="date"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="endDate"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      End Date{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={dayjs(values.endDate)}
                        onChange={(newValue) => {
                          setFieldValue('endDate', newValue);
                        }}
                        minDate={dayjs(values.date)} // Ensure end date can't be before start date
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            id: 'endDate',
                            placeholder: 'Select end date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <ErrorMessage
                      name="endDate"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="time"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Start Time{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        value={values.time}
                        onChange={(newValue) => {
                          setFieldValue('time', newValue);
                        }}
                        ampm
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            id: 'time',
                            placeholder: 'Select time',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <ErrorMessage
                      name="time"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="endTime"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      End Time{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        value={values.endTime}
                        onChange={(newValue) => {
                          setFieldValue('endTime', newValue);
                        }}
                        ampm
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            id: 'endTime',
                            placeholder: 'Select time',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <ErrorMessage
                      name="endTime"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="personInCharge"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Person In Charge{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <FormControl fullWidth required variant="outlined">
                      <Field
                        as={Select}
                        name="personInCharge"
                        id="personInCharge"
                        variant="outlined"
                        displayEmpty
                        placeholder="Select person in charge"
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em style={{ opacity: 0.6 }}>Select person in charge</em>;
                          }

                          const selectedUser = usersData?.find((user) => user.id === selected);
                          return selectedUser ? selectedUser.fullName : '';
                        }}
                        sx={{
                          borderRadius: 1,
                        }}
                      >
                        {loadingUsers ? (
                          <MenuItem disabled>Loading users...</MenuItem>
                        ) : (
                          usersData?.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.fullName}
                            </MenuItem>
                          ))
                        )}
                      </Field>
                    </FormControl>
                    <ErrorMessage
                      name="personInCharge"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="sst"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      SST{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>

                    <Field
                      as={TextField}
                      type="number"
                      name="sst"
                      fullWidth
                      variant="outlined"
                      placeholder="SST in %"
                      InputLabelProps={{ shrink: true }}
                      onKeyDown={(e) => {
                        if (e.key === 'e' || e.key === '-') {
                          e.preventDefault();
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                    <ErrorMessage
                      name="sst"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="status"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Event Status{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <FormControl fullWidth required variant="outlined">
                      <Field
                        as={Select}
                        name="status"
                        id="status"
                        variant="outlined"
                        displayEmpty
                        placeholder="Select status"
                        sx={{
                          borderRadius: 1,
                        }}
                      >
                        {Object.values(EventStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                    <ErrorMessage
                      name="status"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      component="label"
                      htmlFor="bgColor"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Background Color
                    </Typography>
                    <Field name="bgColor">
                      {({ field, form }) => (
                        <MuiColorInput
                          {...field}
                          format="hex"
                          value={field.value || '#f0f4f8'}
                          onChange={(color) => form.setFieldValue('bgColor', color)}
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              height: 42,
                              bgcolor: (theme) =>
                                theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
                              border: 'none',
                              '&:hover': {
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'light' ? 'grey.200' : 'grey.800',
                              },
                            },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Typography
                      component="label"
                      htmlFor="eventLogo"
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Event Logo{' '}
                      <Box component="span" sx={{ color: '#e53e3e' }}>
                        *
                      </Box>
                    </Typography>
                    <Field name="eventLogo" id="eventLogo">
                      {({ field, form }) => (
                        <Upload
                          accept={{ 'image/*': [] }}
                          file={
                            !!field.value &&
                            (typeof field?.value === 'string'
                              ? field?.value
                              : URL.createObjectURL(field?.value))
                          }
                          error={!!form.errors.image}
                          helperText={
                            !!form.errors.image && (
                              <FormHelperText error={!!form.errors.image} sx={{ px: 2 }}>
                                {form.errors.image}
                              </FormHelperText>
                            )
                          }
                          onDrop={(e) => {
                            setFieldValue('eventLogo', e[0]);
                          }}
                          sx={{
                            '& .drop-zone': {
                              height: '100px !important',
                              minHeight: '100px !important',
                              border: '1px dashed',
                              borderColor: 'divider',
                              borderRadius: 1,
                              bgcolor: (theme) =>
                                theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
                              '&:hover': {
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'light' ? 'grey.200' : 'grey.800',
                              },
                            },
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="eventLogo"
                      component={Typography}
                      sx={{
                        color: '#e53e3e',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography
                      sx={{
                        display: 'block',
                        mb: 0.75,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      Preview
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '1/1',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: values.bgColor || '#f0f4f8',
                        overflow: 'hidden',
                      }}
                    >
                      {values.eventLogo ? (
                        <Box
                          component="img"
                          src={
                            typeof values.eventLogo === 'string'
                              ? values.eventLogo
                              : URL.createObjectURL(values.eventLogo)
                          }
                          alt="Preview"
                          sx={{
                            width: '70%',
                            height: '70%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src="/logo/nexea.png"
                          alt="Default"
                          sx={{
                            width: '50%',
                            height: '50%',
                            objectFit: 'contain',
                            opacity: 0.5,
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                        mt: 1,
                        fontSize: '0.75rem',
                      }}
                    >
                      This preview shows how the event logo will appear in the event list.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        onClick={onClose}
                        disabled={isSubmitting}
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          py: 1,
                          px: 3,
                          fontWeight: 500,
                          borderColor: 'divider',
                          textTransform: 'none',
                          fontSize: '0.9rem',
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !formHasChanged}
                        sx={{
                          borderRadius: 1,
                          py: 1,
                          px: 3,
                          fontWeight: 500,
                          backgroundColor: '#000',
                          color: (theme) => theme.palette.primary.contrastText,
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: 'none',
                          },
                          '&.Mui-disabled': {
                            opacity: 0.7,
                          },
                        }}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Event'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

EditEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedEvent: PropTypes.object,
  onEventUpdated: PropTypes.func,
};

export default EditEventModal;
