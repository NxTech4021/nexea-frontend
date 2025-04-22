import React from 'react';
import * as yup from 'yup';
import bcrypt from 'bcryptjs';
import { Form, Field, Formik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { Card, Grid, TextField } from '@mui/material';

// import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'react-toastify';

import { useRouter } from 'src/routes/hooks';

import { endpoints, axiosInstance } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';

const AccountSecurity = () => {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const passSchema = yup.object().shape({
    currentPassword: yup.string().required('Current Password is required.'),
    newPassword: yup.string().required('New Password is required.'),
    confirmPassword: yup
      .string()
      .required('Confirm Password is required.')
      .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
  });

  // eslint-disable-next-line consistent-return
  const checkCurrentPassword = async (currentPassword) => {
    try {
      const isSame = await bcrypt.compare(currentPassword, user?.password);

      if (isSame) {
        return true;
      }

      return false;
    } catch (e) {
      alert(e);
    }
  };

  // eslint-disable-next-line consistent-return
  const onSubmit = async (data, actions) => {
    const { currentPassword, newPassword } = data;

    try {
      const isValidCurrentPassword = await checkCurrentPassword(currentPassword);

      if (!isValidCurrentPassword) {
        return actions.setFieldError('currentPassword', 'Password is incorrect.');
      }

      if (currentPassword === newPassword) {
        return actions.setFieldError(
          'newPassword',
          'Password must be different from the old password.'
        );
      }

      await axiosInstance.patch(endpoints.auth.update, { id: user?.id, password: newPassword });

      toast.success('Successfully updated!', {
        position: 'top-center',
      });

      await logout();

      router.replace('/');

      actions.resetForm();
    } catch (errors) {
      alert(errors);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Formik
        validationSchema={passSchema}
        onSubmit={(values, actions) => onSubmit(values, actions)}
        initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
      >
        <Form>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <Field name="currentPassword">
                {({ field, form: { touched, errors } }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Current password"
                    fullWidth
                    error={touched.currentPassword && errors?.currentPassword}
                    helperText={touched.currentPassword && errors?.currentPassword}
                  />
                )}
              </Field>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <Field name="newPassword">
                {({ field, form: { touched, errors } }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="New password"
                    fullWidth
                    error={touched.newPassword && errors?.newPassword}
                    helperText={touched.newPassword && errors?.newPassword}
                  />
                )}
              </Field>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <Field name="confirmPassword">
                {({ field, form: { touched, errors } }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Confirm password"
                    fullWidth
                    error={touched.confirmPassword && errors?.confirmPassword}
                    helperText={touched.confirmPassword && errors?.confirmPassword}
                  />
                )}
              </Field>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: 'end' }}>
              <LoadingButton type="submit" variant="contained">
                Save Changes
              </LoadingButton>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </Card>
  );
};

export default AccountSecurity;
