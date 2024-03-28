import axios from 'axios';
import { useTheme } from '@emotion/react';
import React, { useState, useCallback } from 'react';

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

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import UploadPhoto from './dropzone';
import AccountSecurity from './security';

const Profile = () => {
  const settings = useSettingsContext();
  const theme = useTheme();
  const { user } = useAuthContext();
  const [currentTab, setCurrentTab] = useState('general');

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

  const handleUpload = async () => {
    if (!image) {
      alert('Upload image first');
      return;
    }

    await axios.post(
      endpoints.auth.upload,
      { id: user?.id, image: url },
      { headers: { 'content-type': 'multipart/form-data' } }
    );
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
              src={user?.photoURL ? user?.photoURL : image}
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

  const renderForm = (
    <Grid item xs={12} md={8} lg={8}>
      <Card sx={{ p: 1 }}>
        <Stack alignItems="flex-end" sx={{ mt: 3 }}>
          <Grid container spacing={2} p={3}>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <TextField fullWidth label="Name" defaultValue={user?.name} />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <TextField fullWidth label="Email address" defaultValue={user?.email} />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <TextField fullWidth label="Email address" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <TextField fullWidth label="Email address" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <TextField fullWidth label="Email address" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <TextField fullWidth label="Email address" />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <TextField fullWidth label="Email address" type="text" />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: 'end' }}>
              <LoadingButton
                type="submit"
                variant="contained"
                onClick={() => {
                  handleUpload();
                }}
              >
                Save Changes
              </LoadingButton>
            </Grid>
          </Grid>
        </Stack>
      </Card>
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
    </Tabs>
  );

  return (
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

      {currentTab === 'security' && <AccountSecurity />}

      {currentTab === 'general' && (
        <Grid container spacing={3}>
          {renderPicture}

          {renderForm}
        </Grid>
      )}
    </Container>
  );
};

export default Profile;
