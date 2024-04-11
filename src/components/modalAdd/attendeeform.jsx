/* eslint-disable jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for */
// eslint-disable-next-line perfectionist/sort-named-imports
import React from 'react';
import axios from 'axios';
import { Form, Field, Formik, } from 'formik';

import { Grid, Button, TextField } from '@mui/material';

const initialValues = {
  firstName: '',
  lastName: '',
  name: '',
  orderNumber: '',
  ticketTotal: '',
  discountCode: '',
  ticketCode: '',
  ticketID: '',
  ticketType: '',
  buyerFirstName: '',
  buyerLastName: '',
  buyerEmail: '',
  phoneNumber: '',
  companyName: '',
};

const CreateAttendeeForm = () => {
  const handleSubmit = async (values, { resetForm }) => {
    try {
      console.log('Form values:', values); 
      await axios.post('http://localhost:3001/api/attendee/create', 
        {
          firstName: values.firstName,
          lastName: values.lastName,
          name: values.name,
          orderNumber: values.orderNumber,
          ticketTotal: values.ticketTotal,
          discountCode: values.discountCode,
          ticketCode: values.ticketCode,
          ticketID: values.ticketID,
          ticketType: values.ticketType,
          buyerFirstName: values.buyerFirstName,
          buyerLastName: values.buyerLastName,
          buyerEmail: values.buyerEmail,
          phoneNumber: values.phoneNumber,
          companyName: values.companyName,
        }
      ); 
      resetForm();
      alert('Attendee created successfully!');
    } catch (error) {
      console.error('Error creating attendee:', error);
    }
  };

  return (
    <Formik  initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
       <Form style={{ paddingTop: '10px' }}>
       <Grid container spacing={2}>
       <Grid item xs={6}>
         <Field
           fullWidth
           label="First Name"
           id="firstName"
           name="firstName"
           as={TextField}
           required
         />
       </Grid>
       <Grid item xs={6}>
         <Field
           fullWidth
           label="Last Name"
           id="lastName"
           name="lastName"
           as={TextField}
           required
         />
       </Grid>
       <Grid item xs={12}>
         <Field
           fullWidth
           label="Name"
           id="name"
           name="name"
           as={TextField}
           required
         />
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
           required
           as={TextField}
         />
       </Grid>
       <Grid item xs={4}>
         <Field
           fullWidth
           label="Ticket ID"
           id="ticketID"
           name="ticketID"
           as={TextField}
           required
         />
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
           required
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
           required
         />
       </Grid> 
       <Grid item xs={6}>
         <Field
           fullWidth
           label="Buyer Email"
           id="buyerEmail"
           name="buyerEmail"
           as={TextField}
           required
         />
       </Grid>
       <Grid item xs={6}>
         <Field
           fullWidth
           label="Phone"
           id="phoneNumber"
           name="phoneNumber"
           as={TextField}
           required
         />
       </Grid>
     
       <Grid item xs={6}>
         <Field
           fullWidth
           label="Company Name"
           id="companyName"
           name="companyName"
           as={TextField}
         />
       </Grid>
       
      
       <Grid item xs={12}>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    color="primary"
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

