import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid2';
import {
  Box,
  Card,
  Stack,
  Container,
  CardHeader,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'src/routes/hooks';

import { useGetAllEvents } from 'src/api/event';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EventInformation from '../event-information';
import TicketInformation from '../ticket-information';
import AttendeeInformation from '../attendee-information';
import OrderAnalytics from '../analytics/order-analytics';
import TicketAnalytics from '../analytics/ticket-analytics';
import CheckInAnalytics from '../analytics/checkIn-analytics';


const EventDetails = ({ id }) => {
  const { data, isLoading, error } = useGetAllEvents(id);

  const router = useRouter();

  if (error) return router.back();
  if (isLoading)
    return (
      <Box
        sx={{
          position: 'relative',
          top: 200,
          textAlign: 'center',
        }}
      >
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            color: (theme) => theme.palette.common.black,
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );

  return (
    <Container maxWidth="xl">

      {/* <CustomBreadcrumbs
        heading={data?.name}
        links={[
          { name: 'Dashboard' },
          { name: 'Event', href: paths.dashboard.events.root },
          { name: data?.name },
        ]}
      /> */}

      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(paths.dashboard.events.root)}
      >
        Events
      </Button>

      <Grid item size={{ xs: 12, md: 6 }}>
        <EventInformation event={data} />
      </Grid>

      <Grid container spacing={2} mt={2}>
        <Grid item size={{ xs: 12 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <TicketAnalytics tickets={data.ticketType} />
            <OrderAnalytics orders={data.order} />
            <CheckInAnalytics checkedIns={data.attendees?.map((attendee) => attendee.checkedIn) || []} />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: 1, borderColor: (theme) => theme.palette.divider, borderRadius: 2 }}>
            <CardContent>
              <AttendeeInformation id={id} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <TicketInformation />
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetails;

EventDetails.propTypes = {
  id: PropTypes.string,
};
