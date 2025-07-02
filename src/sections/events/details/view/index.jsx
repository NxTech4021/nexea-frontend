import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Stack,
  Tooltip,
  Container,
  IconButton,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetAllEvents } from 'src/api/event';

import Iconify from 'src/components/iconify';

import EventInformation from '../event-information';
import TicketInformation from '../ticket-information';
import TotalRevenue from '../analytics/total-revenue';
import AttendeeInformation from '../attendee-information';
import OrderAnalytics from '../analytics/order-analytics';
import TicketAnalytics from '../analytics/ticket-analytics';
import AttendeeAnalytics from '../analytics/attendee-analytic';
// import CheckInAnalytics from '../analytics/checkIn-analytics';

const EventDetails = ({ id }) => {
  const { data, isLoading, error } = useGetAllEvents(id);

  const router = useRouter();
  const theme = useTheme();

  const totalCheckedIn = useMemo(() => {
    const orders = data?.order || [];

    const attendeesData = orders.flatMap((order) => order.attendees);

    return attendeesData.filter((item) => item.status === 'checkedIn')?.length || 0;
  }, [data]);

  const totalTicketsSold = useMemo(() => {
    const orders = data?.order?.filter((a) => a?.status === 'paid') || [];
    const attendees = orders?.flatMap((a) => a?.attendees) || [];

    // const totalSolds = attendees.reduce((acc, cur) => {
    //   if (cur?.ticket) {
    //     acc += 1;
    //   }
    const regularTickets = attendees.filter((cur) => cur?.ticket).length;
    const addOnTickets = attendees.filter((cur) => cur?.ticket?.ticketAddOn).length;

    //   if (cur?.ticket?.ticketAddOn) {
    //     acc += 1;
    //   }

    //   return acc;
    // }, 0);

    // // const totalSolds = orders
    // //   .filter((a) => a?.status === 'paid')
    // //   .reduce((acc, cur) => acc + (cur?.attendees?.length ?? 0), 0);

    // return totalSolds;
    return {
      regularTickets,
      addOnTickets,
    };
  }, [data]);

  const totalRevenue = useMemo(() => {
    const orders = data?.order.filter((a) => a?.status === 'paid' && a.totalAmount !== 0) || [];
    const attendees = orders?.flatMap((a) => a.attendees);

    const discount = orders.reduce((acc, curr) => acc + (curr.discountAmount ?? 0), 0);

    const totalTicketPrice = attendees.reduce(
      (acc, cur) => acc + (cur.ticket.price ?? 0) + (cur.ticket.ticketAddOn?.price ?? 0),
      0
    );

    const totalSolds = orders
      .filter((a) => a?.status === 'paid')
      .reduce((acc, cur) => acc + (cur?.totalAmount ?? 0), 0);

    return totalTicketPrice - discount;
  }, [data]);

  const orders = data?.order?.filter((a) => a?.status === 'paid').flatMap((a) => a.attendees) || [];

  const grouped = orders?.reduce((acc, entry) => {
    const title = entry.ticket?.ticketType?.title;
    const addOn = entry.ticket?.ticketAddOn?.addOn?.name;

    if (!title) return acc;

    if (!acc[title]) {
      acc[title] = {
        title,
        quantity: 1,
      };
    } else {
      acc[title].quantity += 1;
    }

    if (addOn) {
      if (!acc.addOn) {
        acc.addOn = {
          title: `${addOn} (Add On)`,
          quantity: 1,
        };
      } else {
        acc.addOn.quantity += 1;
      }
    }

    return acc;
  }, {});

  const groupedAttendees = useMemo(() => {
    const attendees = data?.order?.flatMap((a) => a?.attendees || []);

    return attendees?.reduce((acc, cur) => {
      if (!acc.some((a) => dayjs(a.date).isSame(cur.created_at, 'date'))) {
        acc.push({
          date: dayjs(cur.created_at).format('L'),
          count: attendees.filter((a) => dayjs(a.created_at).isSame(cur.created_at, 'date')).length,
        });
      }

      return acc;
    }, []);
  }, [data]);

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
            color: theme.palette.common.black,
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Tooltip title="Back to Events">
          <IconButton
            onClick={() => router.push(paths.dashboard.events.root)}
            sx={{
              width: 40,
              height: 40,
              color: theme.palette.mode === 'light' ? 'grey.800' : 'common.white',
              '&:hover': {
                bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
              },
            }}
          >
            <Iconify icon="eva:arrow-back-fill" width={20} height={20} />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid item size={{ xs: 12, md: 6 }}>
        <EventInformation event={data} />
      </Grid>

      <Grid container spacing={2} mt={2}>
        {/* <Grid item size={{ xs: 12 }}>
          <TotalRevenue totalRevenue={totalRevenue} />
        </Grid> */}
        <Grid item size={{ xs: 12 }}>
          <Stack
            direction={{ xs: 'column', md: 'row', lg: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <TicketAnalytics
              tickets={totalTicketsSold.regularTickets}
              addOns={totalTicketsSold.addOnTickets}
              eventName={data.name}
            />

            <OrderAnalytics
              orders={data.order?.filter((a) => a?.status === 'paid') || []}
              eventName={data.name}
              eventId={id}
            />
            {/* <CheckInAnalytics checkedIns={totalCheckedIn} id={id} /> */}
            <TotalRevenue totalRevenue={totalRevenue} />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: 1, borderColor: theme.palette.divider, borderRadius: 2 }}>
            <CardContent>
              <AttendeeInformation id={id} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <TicketInformation tickets={Object.values(grouped) || []} />
            <AttendeeAnalytics groupedAttendees={groupedAttendees} />
            {/* <TicketInformation tickets={Object.values(grouped) || []} /> */}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetails;

EventDetails.propTypes = {
  id: PropTypes.string,
};
