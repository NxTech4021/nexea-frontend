/* eslint-disable react-hooks/exhaustive-deps */
import dayjs from 'dayjs';
/* eslint-disable no-unused-vars */
import * as yup from 'yup';
import { useTheme } from '@emotion/react';
import { Form, Field, Formik } from 'formik';
import React, { useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { LoadingButton } from '@mui/lab';
import {
  Tab,
  Grid,
  Card,
  Tabs,
  Stack,
  Avatar,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { endpoints, axiosInstance } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import UploadPhoto from './dropzone';
import AccountSecurity from './security';
import QuickBooksIntegration from './quickbooks';

dayjs.extend(localizedFormat);

const Profile = () => {
  const settings = useSettingsContext();
  const theme = useTheme();
  const { user } = useAuthContext();
  const [currentTab, setCurrentTab] = useState('general');
  console.log(user);

  const validationSchema = yup.object({
    email: yup
      .string('Enter your email')
      .email('Enter a valid email')
      .required('Email is required'),
    name: yup.string('Enter your name').required('Name is required'),
    department: yup.string('Enter your department').required('Department is required'),
  });

  const initialValues = {
    name: user?.fullName || '',
    email: user?.email || '',
    department: user?.department || '',
  };

  const [image, setImage] = useState();
  const [url, setURL] = useState();

  const onDrop = useCallback((e) => {
    const preview = URL.createObjectURL(e[0]);
    setURL(e[0]);
    setImage(preview);
  }, []);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const onSubmit = async (values) => {
    try {
      await axiosInstance.patch(
        endpoints.auth.update,
        {
          id: user?.id,
          image: url,
          name: values.name,
          email: values.email,
          department: values.department,
          address: values.address,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Successfully updated!', {
        position: 'top-center',
      });
    } catch (error) {
      alert(error);
    }
  };

  const renderPicture = (
    <Grid item xs={12} md={4} lg={4}>
      <Card sx={{ p: 1, textAlign: 'center' }}>
        <Stack alignItems="center" p={3} spacing={2}>
          <UploadPhoto onDrop={onDrop}>
            <Avatar
              sx={{
                width: 1,
                height: 1,
                borderRadius: '50%',
              }}
              src={image || user?.photoURL}
            />
          </UploadPhoto>
          <Typography display="block" color={theme.palette.grey['600']} sx={{ fontSize: 12 }}>
            Allowed *.jpeg, *.jpg, *.png, *.gif max size of 3 Mb
          </Typography>
          <Button color="error" sx={{ mt: 3, width: '100%' }}>
            Delete
          </Button>
        </Stack>
      </Card>
    </Grid>
  );

  const renderForm = ({ dirty }) => (
    <Grid item xs={12} md={8} lg={8}>
      <Form>
        <Card sx={{ p: 1 }}>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <Grid container spacing={2} p={3}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Field name="name">
                  {({ field, form: { errors, touched } }) => (
                    <TextField
                      fullWidth
                      error={touched.name && errors.name}
                      {...field}
                      label="Name"
                      defaultValue={user?.name}
                      helperText={touched.name && errors.name}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Field name="email">
                  {({ field, form: { errors, touched } }) => (
                    <TextField
                      fullWidth
                      error={touched.email && errors.email}
                      {...field}
                      label="Email address"
                      defaultValue={user?.email}
                      helperText={touched.email && errors.email}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Field name="department">
                  {({ field, form: { errors, touched } }) => (
                    <TextField
                      fullWidth
                      error={touched.department && errors.department}
                      {...field}
                      label="Department"
                      defaultValue={user?.department}
                      helperText={touched.department && errors.department}
                    />
                  )}
                </Field>
              </Grid>
              {/* <Grid item xs={12} sm={6} md={6} lg={6}>
                <Field name="address">
                  {({ field, form: { errors, touched } }) => (
                    <TextField
                      fullWidth
                      error={touched.address && errors.address}
                      {...field}
                      label="Address"
                      defaultValue={user?.address}
                      helperText={touched.address && errors.address}
                    />
                  )}
                </Field>
              </Grid> */}
              <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: 'end' }}>
                <LoadingButton type="submit" variant="contained" disabled={!dirty && !url}>
                  Save Changes
                </LoadingButton>
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Form>
    </Grid>
  );

  const tabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      <Tab
        label="General"
        value="general"
        icon={<Iconify icon="solar:user-id-bold" width={24} />}
      />
      <Tab
        label="Security"
        value="security"
        icon={<Iconify icon="ic:round-vpn-key" width={24} />}
      />
      <Tab
        label="QuickBooks"
        value="quickbooks"
        icon={<Iconify icon="logos:quickbooks" width={24} />}
      />
    </Tabs>
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Profile"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'User',
              href: paths.dashboard.user,
            },
            { name: 'Profile' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {tabs}
        <Typography variant="caption" display="block" gutterBottom color="GrayText">
          Last update: {dayjs(user?.updatedAt).format('LLL')}
        </Typography>

        {currentTab === 'security' && <AccountSecurity />}

        {currentTab === 'quickbooks' && <QuickBooksIntegration />}

        {currentTab === 'general' && (
          <Grid container spacing={3}>
            {renderPicture}
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {renderForm}
            </Formik>
          </Grid>
        )}
      </Container>
      <ToastContainer />
    </>
  );
};

export default Profile;
