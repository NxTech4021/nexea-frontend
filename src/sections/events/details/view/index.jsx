import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Card,
  Stack,
  Container,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetAllEvents } from 'src/api/event';

import Iconify from 'src/components/iconify';

import EventInformation from '../event-information';
import TicketInformation from '../ticket-information';
import AttendeeInformation from '../attendee-information';
import OrderAnalytics from '../analytics/order-analytics';
import TicketAnalytics from '../analytics/ticket-analytics';
import CheckInAnalytics from '../analytics/checkIn-analytics';

const EventDetails = ({ id }) => {
  const { data, isLoading, error } = useGetAllEvents(id);

  const router = useRouter();

  const totalCheckedIn = useMemo(() => {
    const orders = data?.order || [];

    const attendeesData = orders.flatMap((order) => order.attendees);

    return attendeesData.filter((item) => item.status === 'checkedIn')?.length || 0;
  }, [data]);

  const totalTicketsSold = useMemo(() => {
    const orders = data?.order || [];

    const totalSolds = orders
      .filter((a) => a?.status === 'paid')
      .reduce((acc, cur) => acc + (cur?.attendees?.length ?? 0), 0);

    return totalSolds;
  }, [data]);

  const totalRevenue = useMemo(() => {
    const orders = data?.order || [];

    const totalSolds = orders
      .filter((a) => a?.status === 'paid')
      .reduce((acc, cur) => acc + (cur?.totalAmount ?? 0), 0);

    return totalSolds;
  }, [data]);

  const orders = data?.order?.filter((a) => a?.status === 'paid').flatMap((a) => a.attendees) || [];

  const grouped = orders?.reduce((acc, entry) => {
    const title = entry.ticket?.ticketType?.title;
    if (!title) return acc;

    if (!acc[title]) {
      acc[title] = {
        title,
        quantity: 1,
      };
    } else {
      acc[title].quantity += 1;
    }
    return acc;
  }, {});

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
          <Card
            sx={{
              border: 1,
              borderColor: (theme) => theme.palette.divider,
              borderRadius: 2,
              width: 1,
            }}
          >
            <CardContent sx={{ position: 'relative' }}>
              <Iconify
                icon="tdesign:money"
                width={100}
                sx={{
                  position: 'absolute',
                  right: -30,
                  color: '#EBEBEB',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />

              <Box sx={{ cursor: 'pointer' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    className="hover-text"
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Total Revenue
                  </Typography>
                  {/* <Iconify className="hover-icon" icon="eva:arrow-ios-forward-fill" /> */}
                </Stack>
                <Typography variant="h2">
                  {new Intl.NumberFormat('en-MY', {
                    minimumFractionDigits: 2,
                    style: 'currency',
                    currency: 'MYR',
                  }).format(totalRevenue || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{ xs: 12 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <TicketAnalytics tickets={totalTicketsSold} eventName={data.name} />
            <OrderAnalytics
              orders={data.order?.filter((a) => a?.status === 'paid') || []}
              eventName={data.name}
            />
            <CheckInAnalytics checkedIns={totalCheckedIn} id={id} />
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
          <TicketInformation tickets={Object.values(grouped) || []} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetails;

EventDetails.propTypes = {
  id: PropTypes.string,
};
