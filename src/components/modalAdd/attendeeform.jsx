/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line perfectionist/sort-named-imports
import React from 'react';
import axios from 'axios';
/* eslint-disable jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for */
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Form, Field, Formik } from 'formik';
import 'react-toastify/dist/ReactToastify.css';

import { Grid, Button, TextField } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const schema = yup
  .object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    phoneNumber: yup.string().matches(phoneRegExp, 'Phone number is not valid').required(),
    companyName: yup.string().required(),
    // buyerEmail: yup.string().required(),
  })
  .required();

const initialValues = {
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  phoneNumber: '',
  companyName: '',
  orderNumber: '',
  ticketTotal: '',
  discountCode: '',
  ticketCode: '',
  ticketID: '',
  ticketType: '',
  buyerFirstName: '',
  buyerLastName: '',
  buyerEmail: '',
  checkedIn: 'No',
};

// eslint-disable-next-line react/prop-types
const CreateAttendeeForm = ({ dialog, fetchAttendees, selectedEventId }) => {
  const onSubmit = async (values, { resetForm }) => {
    try {
      await axiosInstance.post(endpoints.attendee.create, {
        // Add/remove /api if it doesnt work
        firstName: values.firstName,
        lastName: values.lastName,
        name: values.name,
        email: values.email,
        // orderNumber: values.orderNumber,
        // ticketTotal: values.ticketTotal,
        // discountCode: values.discountCode,
        // ticketCode: values.ticketCode,
        // ticketID: values.ticketID,
        // ticketType: values.ticketType,
        // buyerFirstName: values.buyerFirstName,
        // buyerLastName: values.buyerLastName,
        // buyerName: values.buyerName,
        buyerEmail: values.buyerEmail,
        phoneNumber: values.phoneNumber,
        companyName: values.companyName,
        checkedIn: true,
        eventId: selectedEventId,
      });
      fetchAttendees();
      dialog.onFalse();
      // setIsModalOpen(false);
      resetForm();
      toast.success('Attendeed added successfully!');
    } catch (error) {
      console.log(error);
      toast.error('Error creating attendee:', error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={schema}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ isSubmitting }) => (
        <Form style={{ paddingTop: '10px' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Field name="firstName">
                {({ field, form: { errors } }) => (
                  <TextField
                    required
                    label="First Name"
                    {...field}
                    error={errors.firstName}
                    helperText={errors.firstName}
                    fullWidth
                  />
                )}
              </Field>
            </Grid>
            <Grid item xs={6}>
              <Field name="lastName">
                {({ field, form: { errors } }) => (
                  <TextField
                    required
                    label="Last Name"
                    {...field}
                    error={errors.lastName}
                    helperText={errors.lastName}
                    fullWidth
                  />
                )}
              </Field>
            </Grid>
            <Grid item xs={12}>
              <Field fullWidth label="Name" id="name" name="name" as={TextField} />
            </Grid>
            <Grid item xs={6}>
              <Field name="email">
                {({ field, form: { errors } }) => (
                  <TextField
                    required
                    label="Email"
                    {...field}
                    error={errors.email}
                    fullWidth
                    helperText={errors.email}
                  />
                )}
              </Field>
            </Grid>
            <Grid item xs={4}>
              <Field
                fullWidth
                label="Order Number"
                id="orderNumber"
                name="orderNumber"
                as={TextField}
              />
            </Grid>
            <Grid item xs={4}>
              <Field
                fullWidth
                label="Ticket Total"
                id="ticketTotal"
                name="ticketTotal"
                as={TextField}
              />
            </Grid>
            <Grid item xs={4}>
              <Field
                fullWidth
                label="Discount Code"
                id="discountCode"
                name="discountCode"
                as={TextField}
              />
            </Grid>
            <Grid item xs={4}>
              <Field
                fullWidth
                label="Ticket Code"
                id="ticketCode"
                name="ticketCode"
                as={TextField}
              />
            </Grid>
            <Grid item xs={4}>
              <Field fullWidth label="Ticket ID" id="ticketID" name="ticketID" as={TextField} />
            </Grid>
            <Grid item xs={4}>
              <Field
                fullWidth
                label="Ticket Type"
                id="ticketType"
                name="ticketType"
                as={TextField}
              />
            </Grid>
            <Grid item xs={6}>
              <Field
                fullWidth
                label="Buyer First Name"
                id="buyerFirstName"
                name="buyerFirstName"
                as={TextField}
              />
            </Grid>
            <Grid item xs={6}>
              <Field
                fullWidth
                label="Buyer Last Name"
                id="buyerLastName"
                name="buyerLastName"
                as={TextField}
              />
            </Grid>
            <Grid item xs={6}>
              <Field fullWidth label="Buyer Name" id="buyerName" name="buyerName" as={TextField} />
            </Grid>
            <Grid item xs={6}>
              <Field name="buyerEmail">
                {({ field, form: { errors } }) => (
                  <TextField
                    label="Buyer Email"
                    {...field}
                    error={errors.buyerEmail}
                    fullWidth
                    helperText={errors.buyerEmail}
                  />
                )}
              </Field>
            </Grid>
            <Grid item xs={6}>
              <Field fullWidth name="phoneNumber">
                {({ field, form: { errors } }) => (
                  <TextField
                    required
                    label="Phone Number"
                    {...field}
                    error={errors.phoneNumber}
                    fullWidth
                    helperText={errors.phoneNumber}
                    placeholder="123-123123"
                  />
                )}
              </Field>
            </Grid>

            <Grid item xs={6}>
              <Field fullWidth name="companyName">
                {({ field, form: { errors } }) => (
                  <TextField
                    required
                    label="Company name"
                    {...field}
                    error={errors.companyName}
                    fullWidth
                    helperText={errors.companyName}
                  />
                )}
              </Field>
            </Grid>

            <Grid item xs={12}>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    Submit
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
  dialog: PropTypes.object,
};
