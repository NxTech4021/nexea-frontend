import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useMemo, useEffect, useCallback } from 'react';

import { Box, Stack, Button, Typography, Grid2 as Grid, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';
import { useCartStore } from 'src/utils/store';

import { useGetCart } from 'src/api/cart/cart';
import { MaterialUISwitch } from 'src/layouts/dashboard/header';

import { useSettingsContext } from 'src/components/settings';

import TickerPurchaseHeader from '../header';
import { Cart } from '../context/ticket-context';
import { useGetEvent } from '../hooks/use-get-event';
import TicketPaymentCard from '../ticket-payment-card';
import TicketSelectionCard from '../ticket-selection-card';
import TicketInformationCard from '../ticket-information-card';

const TicketPurchaseView = ({ eventIdParams }) => {
  localStorage.setItem('eventId', eventIdParams);
  const mdDown = useResponsive('down', 'md');
  const settings = useSettingsContext();
  const tixs = useCartStore((state) => state.tickets);

  const {
    eventData,
    eventLoading: isEventLoading,
    eventMutate: mutate,
  } = useGetEvent(eventIdParams);

  const { data: cartData, isLoading: cartLoading, mutate: cartMutate } = useGetCart();

  const loading = useBoolean();

  const handleCheckout = useCallback(async () => {
    try {
      loading.onTrue();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Filter only selected tickets
      const tickets = tixs.filter((tix) => tix.selectedQuantity !== 0);

      await axiosInstance.post('/api/cart/checkout', {
        tickets,
        eventId: eventData.id,
      });
      toast.info('Your cart is ready!');
      cartMutate();
    } catch (error) {
      // if (error?.ticketId) {
      //   setUnavailableTicket(error?.ticketId);
      // }
      toast.error(error?.message);
    } finally {
      loading.onFalse();
      mutate();
    }
  }, [cartMutate, eventData, loading, mutate, tixs]);

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
      handleCheckout,
    }),
    [eventIdParams, eventData, cartData, mutate, cartMutate, cartLoading, handleCheckout]
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

  if (eventData?.status !== 'ACTIVE') {
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

      <Box position="absolute">
        <MaterialUISwitch
          sx={{ m: 1 }}
          checked={settings.themeMode !== 'light'}
          onChange={() =>
            settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')
          }
        />
      </Box>

      <Box
        px={{ lg: 15 }}
        bgcolor={settings.themeMode === 'light' && '#F4F4F4'}
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
              <TicketPaymentCard />
            </Grid>
          </Grid>
        ) : (
          <Box height={`calc(100vh - ${76}px)`} p={1}>
            {cartData ? <TicketInformationCard /> : <TicketSelectionCard />}
            {/* <Box position="fixed" bottom={0} left={0} width={1}>
              <TicketPaymentCard />
            </Box> */}
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
