import React, { useState } from 'react';

import { Grid, Card, Stack, Container, TextField, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const CreateEvent = () => {
  const settings = useSettingsContext();
  const [file, setFile] = useState();

  const mdUp = useResponsive('up', 'md');

  const handleLahTiber = (e) => {
    const url = URL.createObjectURL(e.target.files[0]);
    setFile(url);
  };

  const renderInfo = (
    <Grid container>
      {mdUp && (
        <Grid md={4} >
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Title, short description, image...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          <Stack spacing={1.5} sx={{ p: 3 }}>
            <Typography variant="subtitle2">Event name</Typography>
            <TextField placeholder="Ex: DisruptInvest..." />
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUploadCSV = (
    <>
      <input type="file" name="f" id="f" accept={['image/jpg']} onChange={handleLahTiber} />
      {file && <img src={file} alt="prev" />}
    </>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create new event"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Event',
            href: paths.dashboard.events.root,
          },
          { name: 'New Event' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Stack spacing={3}>
        {renderInfo}
        {renderUploadCSV}
      </Stack>
    </Container>
  );
};

export default CreateEvent;
