// import { useTheme } from '@emotion/react';

import CountUp from 'react-countup';

import Grid from '@mui/material/Grid';

import useGetEvents from 'src/hooks/use-get-events';
import useGetAttendees from 'src/hooks/use-get-attendees';

import { formatLargeNumber } from 'src/utils/format-number';

import EventListsDashboard from './list-events';
import AnalyticsWidget from './analytic-widget-summary';

// ----------------------------------------------------------------------

export default function Dashboard() {
  const { data } = useGetAttendees();
  const { data: eventData } = useGetEvents();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <AnalyticsWidget
          title="Total Attendees"
          num={
            <CountUp
              start={0}
              end={data?.attendees?.length || 0}
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
        <EventListsDashboard />
      </Grid>
    </Grid>
  );
}
