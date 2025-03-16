import dayjs from 'dayjs';
import { toast } from 'sonner';
import Duration from 'dayjs/plugin/duration';
import React, { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
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

import axiosInstance, { endpoints } from 'src/utils/axios';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

dayjs.extend(Duration);

const TickerPurchaseHeader = () => {
  const { data: cartData, eventData, mutate: eventMutate, cartMutate: mutate } = useGetCartData();
  const [expiryTime, setExpiryTime] = useState(null);

  const smUp = useResponsive('up', 'sm');
  const mdDown = useResponsive('down', 'md');
  const timeOut = useBoolean();
  const extend = useBoolean();

  const handleRemoveCart = useCallback(async () => {
    if (!cartData) return;
    try {
      await axiosInstance.delete(`/api/cart/${cartData?.id}`);
      mutate(undefined);
      eventMutate();
      timeOut.onFalse();
    } catch (error) {
      toast.error(error?.message || 'Error remove cart', {
        variant: 'error',
      });
    }
  }, [cartData, mutate, timeOut, eventMutate]);

  const extendSession = useCallback(async () => {
    try {
      extend.onTrue();
      const res = await axiosInstance.patch(endpoints.cart.extendSession);
      mutate();
      toast.success(res?.data?.message);
      timeOut.onFalse();
    } catch (error) {
      toast.error(error);
    } finally {
      extend.onFalse();
    }
  }, [mutate, extend, timeOut]);

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
          px={{ sm: 5, md: 15 }}
          justifyContent={mdDown && 'space-between'}
        >
          <Image src="/assets/nexea.png" width={120} />
          {!mdDown && (
            <Stack flexGrow={1}>
              <ListItemText
                primary={eventData?.name}
                secondary={dayjs(eventData?.date).format('LLL')}
                sx={{ textAlign: 'center' }}
              />
            </Stack>
          )}

          {cartData && (
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
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                {!cartData?.isExtended && (
                  <LoadingButton
                    startIcon={<Iconify icon="mingcute:time-line" width={18} />}
                    variant="outlined"
                    sx={{
                      borderRadius: 0.5,
                    }}
                    loading={extend.value}
                    onClick={extendSession}
                  >
                    Extend 5 minutes
                  </LoadingButton>
                )}
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TickerPurchaseHeader;
