import useSWR from 'swr';
import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Form, Field, Formik, ErrorMessage } from 'formik';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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

} from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';


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

  // Function to check if form values have changed from initial values
  const hasFormChanged = (currentValues, initialValues) => 
    Object.keys(initialValues).some(
      (key) => currentValues[key] !== initialValues[key]
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="edit-event-dialog-title"
      aria-describedby="edit-event-dialog-description"
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: { 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => 
            theme.palette.mode === 'light' 
              ? 'linear-gradient(to bottom, #ffffff, #f9fafc)'
              : 'linear-gradient(to bottom, #1a202c, #2d3748)'
        }
      }}
    >
      <DialogTitle 
        id="edit-event-dialog-title" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          py: 3,
          px: 4,
          backgroundColor: (theme) => 
            theme.palette.mode === 'light'
              ? 'rgba(245, 247, 250, 0.85)'
              : 'rgba(26, 32, 44, 0.85)'
        }}
      >
        <Avatar
          alt="Event"
          src="/logo/nexea.png"
          sx={{ 
            width: 58, 
            height: 58, 
            marginRight: 2.5,
            border: (theme) => `3px solid ${theme.palette.background.paper}`,
            backgroundColor: (theme) => 
              theme.palette.mode === 'light' ? '#f0f4f8' : '#2d3748'
          }}
        />
        <Box>
          <Typography 
            variant="h5" 
            fontWeight="700" 
            sx={{ 
              color: (theme) => theme.palette.text.primary,
              letterSpacing: '-0.3px',
              mb: 0.5
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
              fontSize: '0.85rem'
            }}
          >
            <Box component="span" sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: '#34c759', 
              display: 'inline-block',
              mr: 1
            }} />
            Edit Event Details
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ 
        p: 4, 
        backgroundColor: (theme) => theme.palette.background.paper 
      }}>
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
                <Grid container spacing={3.5}>
                  <Grid item xs={12}>
                    <Typography 
                      component="label" 
                      htmlFor="name"
                      sx={{ 
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        fontSize: '0.8rem'
                      }}
                    >
                      Event Name <Box component="span" sx={{ color: '#e53e3e' }}>*</Box>
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
                          borderRadius: 2,
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.5)',
                          color: (theme) => theme.palette.text.primary,
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' ? '#f0f5fa' : 'rgba(45, 55, 72, 0.8)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' ? '#fff' : 'rgba(45, 55, 72, 0.9)',
                            '& fieldset': {
                              borderColor: (theme) => 
                                theme.palette.mode === 'light' ? '#64b5f6' : '#90cdf4',
                              borderWidth: '1.5px'
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: (theme) => theme.palette.text.primary,
                          }
                        }
                      }}
                    />
                    <ErrorMessage
                      name="name"
                      component={Typography}
                      sx={{ 
                        color: (theme) => theme.palette.mode === 'light' ? '#e53e3e' : '#fc8181', 
                        fontSize: '0.75rem', 
                        mt: 0.75, 
                        ml: 1.5 
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography 
                      component="label" 
                      htmlFor="description"
                      sx={{ 
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        fontSize: '0.8rem'
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
                          borderRadius: 2,
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.5)',
                          color: (theme) => theme.palette.text.primary,
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' ? '#f0f5fa' : 'rgba(45, 55, 72, 0.8)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' ? '#fff' : 'rgba(45, 55, 72, 0.9)',
                            '& fieldset': {
                              borderColor: (theme) => 
                                theme.palette.mode === 'light' ? '#64b5f6' : '#90cdf4',
                              borderWidth: '1.5px'
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: (theme) => theme.palette.text.primary,
                          }
                        }
                      }}
                    />
                    <ErrorMessage
                      name="description"
                      component={Typography}
                      sx={{ 
                        color: (theme) => theme.palette.mode === 'light' ? '#e53e3e' : '#fc8181', 
                        fontSize: '0.75rem', 
                        mt: 0.75, 
                        ml: 1.5 
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography 
                      component="label" 
                      htmlFor="date"
                      sx={{ 
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        fontSize: '0.8rem'
                      }}
                    >
                      Event Date <Box component="span" sx={{ color: '#e53e3e' }}>*</Box>
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
                            id: "date",
                            placeholder: "Select date",
                            sx: { 
                              '& .MuiOutlinedInput-root': { 
                                borderRadius: 2,
                                backgroundColor: (theme) => 
                                  theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.5)',
                                color: (theme) => theme.palette.text.primary,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  backgroundColor: (theme) => 
                                    theme.palette.mode === 'light' ? '#f0f5fa' : 'rgba(45, 55, 72, 0.8)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: (theme) => 
                                    theme.palette.mode === 'light' ? '#fff' : 'rgba(45, 55, 72, 0.9)',
                                  '& fieldset': {
                                    borderColor: (theme) => 
                                      theme.palette.mode === 'light' ? '#64b5f6' : '#90cdf4',
                                    borderWidth: '1.5px'
                                  }
                                },
                                '& .MuiInputBase-input': {
                                  color: (theme) => theme.palette.text.primary,
                                }
                              }
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                    <ErrorMessage
                      name="date"
                      component={Typography}
                      sx={{ 
                        color: (theme) => theme.palette.mode === 'light' ? '#e53e3e' : '#fc8181', 
                        fontSize: '0.75rem', 
                        mt: 0.75, 
                        ml: 1.5 
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography 
                      component="label" 
                      htmlFor="personInCharge"
                      sx={{ 
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        fontSize: '0.8rem'
                      }}
                    >
                      Person In Charge <Box component="span" sx={{ color: '#e53e3e' }}>*</Box>
                    </Typography>
                    <FormControl fullWidth required variant="outlined" sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.5)',
                        color: (theme) => theme.palette.text.primary,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#f0f5fa' : 'rgba(45, 55, 72, 0.8)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#fff' : 'rgba(45, 55, 72, 0.9)',
                          '& fieldset': {
                            borderColor: (theme) => 
                              theme.palette.mode === 'light' ? '#64b5f6' : '#90cdf4',
                            borderWidth: '1.5px'
                          }
                        },
                        '& .MuiSelect-select': {
                          color: (theme) => theme.palette.text.primary,
                        }
                      }
                    }}>
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
                          
                          const selectedUser = usersData?.find(user => user.id === selected);
                          return selectedUser ? selectedUser.fullName : '';
                        }}
                        sx={{
                          '& .MuiMenuItem-root': {
                            color: (theme) => theme.palette.text.primary,
                          }
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
                        color: (theme) => theme.palette.mode === 'light' ? '#e53e3e' : '#fc8181', 
                        fontSize: '0.75rem', 
                        mt: 0.75, 
                        ml: 1.5 
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography 
                      component="label" 
                      htmlFor="tickera_api"
                      sx={{ 
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        fontSize: '0.8rem'
                      }}
                    >
                      Tickera API
                    </Typography>
                    <Field
                      as={TextField}
                      type="text"
                      name="tickera_api"
                      id="tickera_api"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter Tickera API"
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.5)',
                          color: (theme) => theme.palette.text.primary,
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' ? '#f0f5fa' : 'rgba(45, 55, 72, 0.8)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' ? '#fff' : 'rgba(45, 55, 72, 0.9)',
                            '& fieldset': {
                              borderColor: (theme) => 
                                theme.palette.mode === 'light' ? '#64b5f6' : '#90cdf4',
                              borderWidth: '1.5px'
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: (theme) => theme.palette.text.primary,
                          }
                        }
                      }}
                    />
                    <ErrorMessage
                      name="tickera_api"
                      component={Typography}
                      sx={{ 
                        color: (theme) => theme.palette.mode === 'light' ? '#e53e3e' : '#fc8181', 
                        fontSize: '0.75rem', 
                        mt: 0.75, 
                        ml: 1.5 
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography 
                      component="label" 
                      htmlFor="status"
                      sx={{ 
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        fontSize: '0.8rem'
                      }}
                    >
                      Event Status <Box component="span" sx={{ color: '#e53e3e' }}>*</Box>
                    </Typography>
                    <FormControl fullWidth required variant="outlined" sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.5)',
                        color: (theme) => theme.palette.text.primary,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#f0f5fa' : 'rgba(45, 55, 72, 0.8)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#fff' : 'rgba(45, 55, 72, 0.9)',
                          '& fieldset': {
                            borderColor: (theme) => 
                              theme.palette.mode === 'light' ? '#64b5f6' : '#90cdf4',
                            borderWidth: '1.5px'
                          }
                        },
                        '& .MuiSelect-select': {
                          color: (theme) => theme.palette.text.primary,
                        }
                      }
                    }}>
                      <Field
                        as={Select}
                        name="status"
                        id="status"
                        variant="outlined"
                        displayEmpty
                        placeholder="Select status"
                        sx={{
                          '& .MuiMenuItem-root': {
                            color: (theme) => theme.palette.text.primary,
                          }
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
                        color: (theme) => theme.palette.mode === 'light' ? '#e53e3e' : '#fc8181', 
                        fontSize: '0.75rem', 
                        mt: 0.75, 
                        ml: 1.5 
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                      <Button
                        onClick={onClose}
                        disabled={isSubmitting}
                        variant="outlined"
                        sx={{
                          borderRadius: 4,
                          height: '46px',
                          padding: '0 24px',
                          fontWeight: 600,
                          borderColor: (theme) => theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568',
                          color: (theme) => theme.palette.mode === 'light' ? '#64748b' : '#a0aec0',
                          borderWidth: '1.5px',
                          letterSpacing: '0.3px',
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          '&:hover': {
                            backgroundColor: (theme) => theme.palette.mode === 'light' 
                              ? '#f8fafc' 
                              : 'rgba(74, 85, 104, 0.2)',
                            borderColor: (theme) => theme.palette.mode === 'light' 
                              ? '#cbd5e1' 
                              : '#718096',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !formHasChanged}
                        sx={{
                          borderRadius: 4,
                          height: '46px',
                          padding: '0 28px',
                          fontWeight: 600,
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? '#38bdf8' : '#3182ce',
                          color: 'white',
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          letterSpacing: '0.3px',
                          boxShadow: 'none',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' ? '#0ea5e9' : '#2b6cb0',
                            boxShadow: 'none',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'light' 
                                ? 'rgba(56, 189, 248, 0.5)' 
                                : 'rgba(49, 130, 206, 0.5)',
                            color: (theme) => 
                              theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(226, 232, 240, 0.7)',
                          }
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