import { enqueueSnackbar } from 'notistack';
import React, { useMemo, useEffect, useCallback } from 'react';

import { Box, Grid, Stack, Container, Typography, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { getCookie } from 'src/utils/get-cookie';
import axiosInstance, { endpoints } from 'src/utils/axios';

import { useGetCart } from 'src/api/cart/cart';

import TickerPurchaseHeader from '../header';
import { Cart } from '../context/ticket-context';
import TicketSelectionCard from '../ticket-selection-card';

const TicketPurchaseView = () => {
  const searchParams = new URLSearchParams(window.location.search);
  localStorage.setItem('eventId', searchParams.get('eventId'));
  localStorage.setItem('ticketTypeId', searchParams.get('ticketTypeId'));

  const ticketStorage = JSON.parse(localStorage.getItem('cart'));

  const ticketTypeId = localStorage.getItem('ticketTypeId');
  const eventId = localStorage.getItem('eventId');

  // get cartSessionId from browser cookie set by the server
  const cartSessionId = getCookie();

  const { data, isLoading, mutate, error } = useGetCart(cartSessionId, eventId, ticketTypeId);

  const loading = useBoolean();

  const createNewSession = useCallback(async () => {
    loading.onTrue();
    try {
      return await axiosInstance.post(endpoints.cart.createSession, {
        ticketTypeId,
        eventId,
      });
    } catch (err) {
      return enqueueSnackbar('Error creating session', {
        variant: 'error',
      });
    } finally {
      loading.onFalse();
    }
  }, [ticketTypeId, eventId, loading]);

  useEffect(() => {
    if (!cartSessionId) {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSessionId]);

  const memoizedValue = useMemo(
    () => ({
      ticketTypeId,
      eventId,
      cartSessionId,
      data,
      mutate,
    }),
    [ticketTypeId, eventId, cartSessionId, data, mutate]
  );

  if (loading.value || isLoading) {
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

  if (!isLoading && !data) {
    return <Typography sx={{ textAlign: 'center' }}>No data found.</Typography>;
  }

  return (
    <Cart.Provider value={memoizedValue}>
      <TickerPurchaseHeader />

      <Container sx={{ bgcolor: '#F4F4F4' }} maxWidth="xl">
        <Box
          // px={{ xs: 2, lg: 15 }}
          mx={{ xs: 2, lg: 15 }}
          sx={{
            overflow: 'hidden',
            py: 12,
            bgcolor: 'red',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
                <TicketSelectionCard />

                <TicketInformationCard />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <TicketPaymentCard />
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          bgcolor: 'white',
          width: 1,
          p: 2,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          sx={{
            borderRadius: 0.5,
          }}
        >
          Proceed to payment
        </Button>
      </Box> */}
    </Cart.Provider>
  );
};

export default TicketPurchaseView;
