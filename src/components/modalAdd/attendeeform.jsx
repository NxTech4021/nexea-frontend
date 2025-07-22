/* eslint-disable unused-imports/no-unused-imports */
import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import useSWR, { mutate } from 'swr';
import { Form, Field, Formik } from 'formik';
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

import { 
  Box, 
  Grid, 
  Chip, 
  Button, 
  Select, 
  MenuItem, 
  TextField, 
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
  CircularProgress
} from '@mui/material';

import { endpoints, axiosInstance } from 'src/utils/axios';

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const schema = yup
  .object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    phoneNumber: yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone number is required'),
    companyName: yup.string().required('Company name is required'),
    ticketTypeId: yup.string().required('Ticket type is required'),
    addOnId: yup.string(), // Optional
  })
  .required();

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  companyName: '',
  ticketTypeId: '',
  addOnId: '',
};

const CreateAttendeeForm = ({ dialog, selectedEventId }) => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Fetch ticket types for the event
  useEffect(() => {
    const fetchTicketTypes = async () => {
      if (!selectedEventId) return;
      
      setIsLoadingTickets(true);
      try {
        const response = await axiosInstance.get(`/api/cart/tickets/${selectedEventId}`);
        const eventData = response.data;
        
        if (eventData.ticketType) {
          // Filter only active ticket types
          const activeTicketTypes = eventData.ticketType.filter(ticket => ticket.isActive);
          setTicketTypes(activeTicketTypes);
        }
      } catch (error) {
        console.error('Error fetching ticket types:', error);
        toast.error('Failed to load ticket types');
      } finally {
        setIsLoadingTickets(false);
      }
    };

    fetchTicketTypes();
  }, [selectedEventId]);

  // Update add-ons when ticket type changes
  useEffect(() => {
    if (selectedTicketType) {
      setAddOns(selectedTicketType.addOns || []);
    } else {
      setAddOns([]);
    }
  }, [selectedTicketType]);

  const renderTicketTypeMenuItems = () => {
    if (isLoadingTickets) {
      return (
        <MenuItem disabled>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          Loading ticket types...
        </MenuItem>
      );
    }

    if (ticketTypes.length === 0) {
      return <MenuItem disabled>No active ticket types available</MenuItem>;
    }

    return ticketTypes.map((ticketType) => (
      <MenuItem key={ticketType.id} value={ticketType.id}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {ticketType.title}
            </Typography>
            {ticketType.description && (
              <Typography variant="caption" color="text.secondary">
                {ticketType.description}
              </Typography>
            )}
          </Box>
          <Chip 
            label={`RM ${ticketType.price.toFixed(2)}`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
      </MenuItem>
    ));
  };

  const onSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitting(true);
      
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        companyName: values.companyName,
        ticketTypeId: values.ticketTypeId,
        addOnId: values.addOnId || null,
        eventId: selectedEventId,
      };

      await axiosInstance.post('/api/attendee/create-manual', payload);

      dialog.onFalse();
      resetForm();
      toast.success('Attendee added successfully!');
      
      // Refresh the attendee list by triggering SWR revalidation
      mutate(`/api/attendee/?eventId=${selectedEventId}`);
      
    } catch (error) {
      console.error('Error creating attendee:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error creating attendee';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTicketTypeChange = (ticketTypeId, setFieldValue) => {
    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    setSelectedTicketType(ticketType);
    setFieldValue('ticketTypeId', ticketTypeId);
    // Reset add-on selection when ticket type changes
    setFieldValue('addOnId', '');
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={schema}
      validateOnBlur
      validateOnChange={false}
    >
      {({ isSubmitting, setFieldValue, values, errors, touched }) => (
        <Form style={{ paddingTop: '10px' }}>
          <Grid container spacing={2}>       
            <Grid item xs={6}>
              <Field name="firstName">
                {({ field }) => (
                  <TextField
                    required
                    label="First Name"
                    {...field}
                    error={!!(errors.firstName && touched.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    fullWidth
                  />
                )}
              </Field>
            </Grid>
            
            <Grid item xs={6}>
              <Field name="lastName">
                {({ field }) => (
                  <TextField
                    required
                    label="Last Name"
                    {...field}
                    error={!!(errors.lastName && touched.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    fullWidth
                  />
                )}
              </Field>
            </Grid>
            
            <Grid item xs={6}>
              <Field name="email">
                {({ field }) => (
                  <TextField
                    required
                    label="Email"
                    {...field}
                    error={!!(errors.email && touched.email)}
                    helperText={touched.email && errors.email}
                    fullWidth
                  />
                )}
              </Field>
            </Grid>
            
            <Grid item xs={6}>
              <Field name="phoneNumber">
                {({ field }) => (
                  <TextField
                    required
                    label="Phone Number"
                    {...field}
                    error={!!(errors.phoneNumber && touched.phoneNumber)}
                    helperText={touched.phoneNumber && errors.phoneNumber}
                    placeholder="+60123456789"
                    fullWidth
                  />
                )}
              </Field>
            </Grid>

            <Grid item xs={12}>
              <Field name="companyName">
                {({ field }) => (
                  <TextField
                    required
                    label="Company Name"
                    {...field}
                    error={!!(errors.companyName && touched.companyName)}
                    helperText={touched.companyName && errors.companyName}
                    fullWidth
                  />
                )}
              </Field>
            </Grid>

            {/* Ticket Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                Ticket Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                required 
                error={!!(errors.ticketTypeId && touched.ticketTypeId)}
              >
                <InputLabel>Ticket Type</InputLabel>
                <Select
                  value={values.ticketTypeId}
                  onChange={(e) => handleTicketTypeChange(e.target.value, setFieldValue)}
                  label="Ticket Type"
                  disabled={isLoadingTickets}
                >
                  {renderTicketTypeMenuItems()}
                </Select>
                {touched.ticketTypeId && errors.ticketTypeId && (
                  <FormHelperText>{errors.ticketTypeId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {addOns.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Add-on (Optional)</InputLabel>
                  <Select
                    value={values.addOnId}
                    onChange={(e) => setFieldValue('addOnId', e.target.value)}
                    label="Add-on (Optional)"
                  >
                    <MenuItem value="">
                      <em>No add-on</em>
                    </MenuItem>
                    {addOns.map((addOn) => (
                      <MenuItem key={addOn.id} value={addOn.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {addOn.name}
                            </Typography>
                            {addOn.description && (
                              <Typography variant="caption" color="text.secondary">
                                {addOn.description}
                              </Typography>
                            )}
                          </Box>
                          <Chip 
                            label={`RM ${addOn.price.toFixed(2)}`} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Information Note */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'info.lighter', 
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'info.light'
              }}>
                <Typography variant="body2" color="info.darker">
                  <strong>Note:</strong> This attendee will be created with:
                </Typography>
                <Typography variant="caption" color="info.dark" component="div" sx={{ mt: 0.5 }}>
                  • Order Type: <b>Free</b>
                  <br />
                  • Discount Code: <b>MANUALENTRY</b> (100% discount)
                  <br />
                  • Status: <b>Pending</b>
                  <br />
                  • Ticket & QR Code: <b>Generated automatically</b>
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Grid container justifyContent="flex-end" spacing={1}>
                <Grid item>
                  <Button
                    onClick={dialog.onFalse}
                    variant="outlined"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoadingTickets}
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 100 }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Create Attendee'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default CreateAttendeeForm;

CreateAttendeeForm.propTypes = {
  dialog: PropTypes.object.isRequired,
  selectedEventId: PropTypes.string.isRequired,
};
