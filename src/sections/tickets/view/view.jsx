import useSWR from 'swr';
import PropTypes from 'prop-types';
import React, { useMemo, useEffect } from 'react';

import { Box, Stack, Button, Typography, Grid2 as Grid, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useCartStore } from 'src/utils/store';
import { fetcher, endpoints } from 'src/utils/axios';

import { useGetCart } from 'src/api/cart/cart';

import TickerPurchaseHeader from '../header';
import { Cart } from '../context/ticket-context';
import TicketPaymentCard from '../ticket-payment-card';
import TicketSelectionCard from '../ticket-selection-card';
import TicketInformationCard from '../ticket-information-card';

const TicketPurchaseView = ({ eventIdParams }) => {
  localStorage.setItem('eventId', eventIdParams);

  // This function is used to get all event data based on eventId
  const {
    data: eventData,
    isLoading: isEventLoading,
    mutate,
  } = useSWR(endpoints.cart.event(eventIdParams), fetcher);

  const { data: cartData, isLoading: cartLoading } = useGetCart();

  const loading = useBoolean();

  const setTickets = useCartStore((state) => state.setTickets);

  useEffect(() => {
    if (eventData && eventData.ticketType.length) {
      setTickets(
        eventData.ticketType.map((item) => ({
          ...item,
          selectedQuantity: 0,
          subTotal: 0,
        }))
      );
    }
  }, [eventData, setTickets]);

  const memoizedValue = useMemo(
    () => ({
      eventData,
      eventId: eventIdParams,
      data: cartData,
      mutate,
    }),
    [eventIdParams, eventData, cartData, mutate]
  );

  if (loading.value || isEventLoading || cartLoading) {
    return (
      <Box
        sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
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
  }

  if (!eventData) {
    return (
      <Stack
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        alignItems="center"
        spacing={1}
      >
        <Typography variant="h1" color="text.secondary">
          Whoops, the page or event you are looking for was not found.
        </Typography>
        <Button variant="outlined">Go back</Button>
      </Stack>
    );
  }

  if (eventData?.status !== 'live') {
    return (
      <Stack
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        alignItems="center"
        spacing={1}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Event is temporarily closed
        </Typography>
        <Button variant="outlined">Go back</Button>
      </Stack>
    );
  }

  return (
    <Cart.Provider value={memoizedValue}>
      <TickerPurchaseHeader />
      <Box minHeight={76} />
      <Box
        px={{ lg: 15 }}
        bgcolor="#F4F4F4"
        overflow="auto"
        sx={{
          height: `calc(100vh - ${76}px)`,
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          scrollbarColor: '#000000 white',
        }}
      >
        <Grid container spacing={2} minHeight={1} p={2}>
          <Grid size={{ xs: 12, md: 8 }} position="relative">
            {cartData ? <TicketInformationCard /> : <TicketSelectionCard />}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TicketPaymentCard />
          </Grid>
        </Grid>
      </Box>
    </Cart.Provider>
  );
};

export default TicketPurchaseView;

TicketPurchaseView.propTypes = {
  eventIdParams: PropTypes.string,
};

// 1. User click button
// 2. User will see list of tickets and able to choose the quantity ( fetch based on event id )
// 3. User click checkout
// 4. Session countdown will start asap ( created in the database )
// 5. User has only 30 minutes to enter information based on the quantity picked in step 2
// 6. User is able to remove selected ticket
// 7. User is able to apply a discount code
// 8. User cannot refresh the page, if refresh, an alert will be pop up asking for confirmation to refresh
// 9. If user click refresh, then the tickets selected will be added back into the ticket pool.
// 10. Cart session will be removed from the database.
// 11. If user manage to fill in all details and click proceed to payment. Order will be created with the list of order item.
