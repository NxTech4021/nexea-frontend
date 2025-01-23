import useSWR from 'swr';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import React, { useMemo, useEffect, useCallback } from 'react';

import { Box, Stack, Button, Typography, Grid2 as Grid, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useCartStore } from 'src/utils/store';
import { getCookie } from 'src/utils/get-cookie';
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

import { useGetCart } from 'src/api/cart/cart';

import TickerPurchaseHeader from '../header';
import { Cart } from '../context/ticket-context';
import TicketPaymentCard from '../ticket-payment-card';
import TicketSelectionCard from '../ticket-selection-card';

const TicketPurchaseView = ({ eventIdParams }) => {
  const setTickets = useCartStore((state) => state.setTickets);
  const loading = useBoolean();
  localStorage.setItem('eventId', eventIdParams);
  const ticketStorage = JSON.parse(localStorage.getItem('cart'));
  const eventId = localStorage.getItem('eventId');

  // This function is used to get all event data based on eventId
  const { data: eventData, isLoading: isEventLoading } = useSWR(
    endpoints.cart.event(eventId),
    fetcher
  );

  // This function is used to get cart session id stored in the cookie browser
  const cartSessionId = getCookie();

  const { data, isLoading, mutate, error } = useGetCart(cartSessionId, eventId);

  useEffect(() => {
    if (ticketStorage) {
      setTickets([...ticketStorage.state.tickets]);
    } else if (eventData) {
      setTickets(
        eventData.ticketType.map((item) => ({
          ...item,
          quantity: 0,
          subTotal: 0,
        }))
      );
    }
  }, [eventData, setTickets, ticketStorage]);

  const createNewSession = useCallback(async () => {
    loading.onTrue();
    try {
      await axiosInstance.post(endpoints.cart.createSession, {
        eventId,
      });
    } catch (err) {
      enqueueSnackbar('Error creating session', {
        variant: 'error',
      });
    } finally {
      loading.onFalse();
    }
  }, [eventId, loading]);

  useEffect(() => {
    if (!cartSessionId) {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSessionId]);

  const memoizedValue = useMemo(
    () => ({
      // ticketTypeId,
      eventData,
      eventId,
      cartSessionId,
      data,
      mutate,
    }),
    [eventId, cartSessionId, data, mutate, eventData]
  );

  if (loading.value || isLoading || isEventLoading) {
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

  if (!isLoading && error) {
    return (
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        Session ID not found in database.
      </Typography>
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
      {!isLoading && !data && <Typography sx={{ textAlign: 'center' }}>No data found.</Typography>}
      <Box minHeight={64} />
      <Box
        px={{ lg: 15 }}
        bgcolor="#F4F4F4"
        overflow="scroll"
        sx={{ height: `calc(100vh - ${64}px)` }}
      >
        <Grid container spacing={2} minHeight={1} p={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TicketSelectionCard />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TicketPaymentCard />
          </Grid>
        </Grid>

        {/* <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
              <TicketSelectionCard />

              <TicketInformationCard />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <TicketPaymentCard />
          </Grid>
        </Grid> */}
      </Box>
    </Cart.Provider>
  );
};

export default TicketPurchaseView;

TicketPurchaseView.propTypes = {
  eventIdParams: PropTypes.string,
};
