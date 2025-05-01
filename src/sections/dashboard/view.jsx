// import { useTheme } from '@emotion/react';

import CountUp from 'react-countup';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import useGetEvents from 'src/hooks/use-get-events';
import useGetAttendees from 'src/hooks/use-get-attendees';

import { formatLargeNumber } from 'src/utils/format-number';

import { useSettingsContext } from 'src/components/settings';

import AnalyticsWidget from './analytic-widget-summary';
import EventListsEventListsDashboard from './list-events';

// ----------------------------------------------------------------------

export default function Dashboard() {
  const settings = useSettingsContext();

  const { data } = useGetAttendees();
  const { data: eventData } = useGetEvents();

  console.log(eventData);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Dashboard</Typography>
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget
            title="Total Attendees"
            num={
              <CountUp
                start={0}
                end={data?.length || 0}
                formattingFn={(e) => formatLargeNumber(e)}
              />
            }
            color="success"
            icon="heroicons:users-16-solid"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget
            title="Total Events"
            num={
              <CountUp
                start={0}
                end={eventData?.events?.length || 0}
                formattingFn={(e) => formatLargeNumber(e)}
              />
            }
            color="info"
            icon="mdi:events"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget title="Total Investors" num="0" color="warning" icon="fa:users" />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidget
            title="Total Startups"
            num="0"
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
