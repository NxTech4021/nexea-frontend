import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import Duration from 'dayjs/plugin/duration';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Stack,
  AppBar,
  Dialog,
  Button,
  Typography,
  IconButton,
  ListItemText,
  DialogContent,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';

import { useGetCart } from 'src/api/cart/cart';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

dayjs.extend(Duration);

const TickerPurchaseHeader = () => {
  const { data, eventData, mutate: eventMutate } = useGetCartData();
  const [expiryTime, setExpiryTime] = useState(null);

  const smUp = useResponsive('up', 'sm');
  const timeOut = useBoolean();
  const { mutate, data: cartData } = useGetCart();

  const handleRemoveCart = useCallback(async () => {
    if (!cartData) return;
    try {
      await axiosInstance.delete(`/api/cart/${data?.id}`);
      mutate();
      eventMutate();
      timeOut.onFalse();
    } catch (error) {
      enqueueSnackbar(error?.message || 'Error remove cart', {
        variant: 'error',
      });
    }
  }, [cartData, mutate, data, timeOut, eventMutate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs();
      const diff = dayjs(cartData?.expiryDate).diff(now);

      if (!cartData) return;

      if (diff <= 0) {
        setExpiryTime(null);
        clearInterval(timer);
        return;
      }

      const duration = dayjs.duration(diff);

      const formattedTime = `${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;

      setExpiryTime(formattedTime);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [cartData]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     const now = dayjs();
  //     const diff = dayjs(eventData?.date).diff(now);

  //     if (diff <= 0) {
  //       setExpiryTime(null);
  //       clearInterval(timer);
  //       return;
  //     }

  //     const duration = dayjs.duration(diff);

  //     const formattedTime = `${duration.months()} months, ${duration.days()} days, ${duration.hours()} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds`;

  //     setDateStart(formattedTime);
  //   }, 1000);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [eventData]);

  useEffect(() => {
    const now = dayjs();
    const diff = dayjs(cartData?.expiryDate).diff(now);

    if (!cartData) {
      timeOut.onFalse();
      return;
    }

    if (diff <= 0) {
      timeOut.onTrue();
    }
  }, [cartData, expiryTime, timeOut]);

  return (
    <>
      <AppBar sx={{ bgcolor: '#000000', color: 'whitesmoke', p: 2 }} position="fixed">
        <Stack
          direction="row"
          alignItems="center"
          // justifyContent="space-between"
          px={{ sm: 5, md: 15 }}
        >
          <Image src="/assets/nexea.png" width={120} />
          <Stack flexGrow={1}>
            <ListItemText
              primary={eventData?.name}
              secondary={dayjs(eventData?.date).format('LLL')}
              sx={{ textAlign: 'center' }}
            />
            {/* <Typography variant="caption" color="text.secondary" textAlign="center">
            {dateStart}
          </Typography> */}
          </Stack>

          {data && (
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              {expiryTime || 'Session expired'}
            </Typography>
          )}
        </Stack>
      </AppBar>
      <Dialog
        open={timeOut.value}
        fullScreen={!smUp}
        fullWidth
        maxWidth="md"
        PaperProps={{
          ...(smUp && {
            sx: {
              borderRadius: 1,
              height: 500,
            },
          }),
        }}
      >
        {/* <DialogTitle>Time Limit Reached</DialogTitle> */}
        <DialogContent sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
          <IconButton sx={{ position: 'absolute', right: 10 }}>
            <Iconify icon="material-symbols:close-rounded" width={24} />
          </IconButton>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Typography variant="subtitle1">Time Limit Reached</Typography>
              <Typography variant="subtitle2" color="text.secondary" fontSize={13}>
                Your reservation has been released. Please re-start your purchase.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: 0.5,
                }}
                onClick={() => {
                  handleRemoveCart();
                }}
              >
                Return to tickets
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TickerPurchaseHeader;
