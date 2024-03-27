// import { useTheme } from '@emotion/react';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';

import AnalyticsWidget from './analytic-widget-summary';
import EventListsEventListsDashboard from './list-events';

// ----------------------------------------------------------------------

export default function OneView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Dashboard </Typography>
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget
            title="Total Attendees"
            num="100"
            color="success"
            icon="heroicons:users-16-solid"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget title="Total Events" num="100" color="info" icon="mdi:events" />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget title="Total Investors" num="100" color="warning" icon="fa:users" />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget
            title="Total Startups"
            num="100"
            color="error"
            icon="streamline:startup-solid"
          />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <EventListsEventListsDashboard />
        </Grid>
      </Grid>
    </Container>
  );
}
