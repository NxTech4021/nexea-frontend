import * as yup from 'yup';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useEffect, useCallback } from 'react';

import {
  Box,
  Stack,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  ListItemText,
  Grid2 as Grid,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';
import { useCartStore } from 'src/utils/store';

import { useGetCart } from 'src/api/cart/cart';
import { MaterialUISwitch } from 'src/layouts/dashboard/header';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import TickerPurchaseHeader from '../header';
import { Cart } from '../context/ticket-context';
import { useGetEvent } from '../hooks/use-get-event';
import TicketOverviewCard from '../ticket-overview-card';
import TicketSelectionCard from '../ticket-selection-card';
import TicketInformationCard from '../ticket-information-card';

const schema = yup.object().shape({
  buyer: yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Must be a valid email').required('Email is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    company: yup.string().required('Company name is required'),
    isAnAttendee: yup.boolean(),
    ticket: yup.string().when('isAnAttendee', {
      is: (y) => y.val,
      then: (y) => y.string().required('Ticket type is required'),
    }),
  }),
  attendees: yup.array().of(
    yup.object().shape({
      firstName: yup.string().required('First name is required'),
      lastName: yup.string().required('Last name is required'),
      email: yup
        .string()
        .email('Must be a valid email')
        .required('Email is required')
        .test('unique-email', 'Email must be unique', (value, context) => {
          if (!value) return false;
          const { from } = context;
          console.log(from[1]);

          const emails = from[1].value.attendees.map((user) => user.email);
          return emails.filter((email) => email === value).length === 1;
        }),
      phoneNumber: yup
        .string()
        .required('Phone number is required')
        .test('unique-phone-number', 'Phone number must be unique', (value, context) => {
          if (!value) return false;
          const { from } = context;
          const phones = from[1].value.attendees.map((user) => user.phoneNumber);
          return phones.filter((phone) => phone === value).length === 1;
        }),
      company: yup.string().required('Company name is required'),
    })
  ),
});

const TicketPurchaseView = ({ eventIdParams }) => {
  localStorage.setItem('eventId', eventIdParams);
  const mdDown = useResponsive('down', 'md');
  const settings = useSettingsContext();
  const tixs = useCartStore((state) => state.tickets);
  const loading = useBoolean();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('paymentStatus');
  const paymentDialog = useBoolean(paymentStatus === 'failed');

  const cartSessionId = localStorage.getItem('cartSessionId');
  const buyer = JSON.parse(localStorage.getItem('buyer'));

  const {
    eventData,
    eventLoading: isEventLoading,
    eventMutate: mutate,
  } = useGetEvent(eventIdParams);

  const {
    data: cartData,
    isLoading: cartLoading,
    mutate: cartMutate,
    error: cartError,
    isCartExist,
  } = useGetCart(cartSessionId);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      buyer: {
        firstName: buyer?.firstName || '',
        lastName: buyer?.lastName || '',
        email: buyer?.email || '',
        phoneNumber: buyer?.phoneNumber || '',
        company: buyer?.company || '',
        isAnAttendee: buyer?.isAnAttendee || false,
        ticket: buyer?.ticket || '',
      },
      attendees: null,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axiosInstance.post('/api/cart/continuePayment', data);
      window.location.href = res.data.paymentUrl;
    } catch (error) {
      toast.error(error?.message);
    }
  });

  const handleCheckout = useCallback(async () => {
    try {
      loading.onTrue();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Filter only selected tickets
      const tickets = tixs.filter((tix) => tix.selectedQuantity !== 0);

      const res = await axiosInstance.post('/api/cart/checkout', {
        tickets,
        eventId: eventData.id,
      });
      localStorage.setItem('cartSessionId', res.data.cartSessionId);
      toast.info('Your cart is ready!');
      cartMutate();
    } catch (error) {
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

  useEffect(() => {
    if (paymentStatus === 'failed') {
      console.log(paymentStatus);
    }
  }, [paymentStatus]);

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

      <Box position="absolute" left="62%" zIndex={1111}>
        <MaterialUISwitch
          sx={{ m: 1 }}
          checked={settings.themeMode !== 'light'}
          onChange={() =>
            settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')
          }
        />
      </Box>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Box
          // px={{ lg: 15 }}
          // bgcolor={settings.themeMode === 'light' && '#F4F4F4'}
          overflow="auto"
          sx={{
            height: `calc(100vh - ${76}px)`,
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth',
            scrollbarColor: '#000000 white',
          }}
        >
          {!mdDown ? (
            <Grid container spacing={2} minHeight={1}>
              <Grid size={{ xs: 12, md: 8 }} position="relative">
                {isCartExist ? <TicketInformationCard /> : <TicketSelectionCard />}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TicketOverviewCard />
              </Grid>
            </Grid>
          ) : (
            <Box height={`calc(100vh - ${76}px)`} px={1}>
              {isCartExist ? <TicketInformationCard /> : <TicketSelectionCard />}
            </Box>
          )}
        </Box>
      </FormProvider>

      <Dialog
        open={isCartExist && paymentDialog.value}
        PaperProps={{
          sx: {
            borderRadius: 1,
          },
        }}
        fullWidth
      >
        <DialogTitle />
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            <Iconify icon="icon-park-solid:doc-fail" width={50} color="error.main" />
            <ListItemText
              primary="Payment failed"
              secondary="Payment failed. Please check your details or try again."
              slotProps={{
                primary: {
                  variant: 'subtitle1',
                  color: 'text.secondary',
                },
              }}
              sx={{
                textAlign: 'center',
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                const newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                paymentDialog.onFalse();
              }}
            >
              Okay
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions />
      </Dialog>
    </Cart.Provider>
  );
};

export default TicketPurchaseView;

TicketPurchaseView.propTypes = {
  eventIdParams: PropTypes.string,
};
