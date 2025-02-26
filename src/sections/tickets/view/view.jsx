import PropTypes from 'prop-types';
import React, { useMemo, useEffect } from 'react';

import { Box, Stack, Button, Typography, Grid2 as Grid, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useCartStore } from 'src/utils/store';

import { useGetCart } from 'src/api/cart/cart';

import TickerPurchaseHeader from '../header';
import { Cart } from '../context/ticket-context';
import { useGetEvent } from '../hooks/use-get-event';
import TicketPaymentCard from '../ticket-payment-card';
import TicketSelectionCard from '../ticket-selection-card';
import TicketInformationCard from '../ticket-information-card';

const TicketPurchaseView = ({ eventIdParams }) => {
  localStorage.setItem('eventId', eventIdParams);
  const mdDown = useResponsive('down', 'md');

  const {
    eventData,
    eventLoading: isEventLoading,
    eventMutate: mutate,
  } = useGetEvent(eventIdParams);

  const { data: cartData, isLoading: cartLoading, mutate: cartMutate } = useGetCart();

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
      cartMutate,
      cartLoading,
    }),
    [eventIdParams, eventData, cartData, mutate, cartMutate, cartLoading]
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
        {!mdDown ? (
          <Grid container spacing={2} minHeight={1} p={2}>
            <Grid size={{ xs: 12, md: 8 }} position="relative">
              {cartData ? <TicketInformationCard /> : <TicketSelectionCard />}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TicketPaymentCard cartData={cartData} mutate={cartMutate} />
            </Grid>
          </Grid>
        ) : (
          <Box height={`calc(100vh - ${76}px)`} p={1}>
            {cartData ? <TicketInformationCard /> : <TicketSelectionCard />}
          </Box>
        )}
      </Box>
    </Cart.Provider>
  );
};

export default TicketPurchaseView;

TicketPurchaseView.propTypes = {
  eventIdParams: PropTypes.string,
};
