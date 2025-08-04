import dayjs from 'dayjs';
import { mutate } from 'swr';
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
  keyframes,
  Typography,
  ListItemText,
  DialogContent,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { endpoints, axiosInstance } from 'src/utils/axios';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

dayjs.extend(Duration);

const borderAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const TickerPurchaseHeader = () => {
  const { data: cartData, eventData, mutate: eventMutate, cartMutate } = useGetCartData();
  const [expiryTime, setExpiryTime] = useState(null);

  const smUp = useResponsive('up', 'sm');
  const mdDown = useResponsive('down', 'md');
  const timeOut = useBoolean();
  const extend = useBoolean();

  const handleRemoveCart = useCallback(async () => {
    if (!cartData) return;
    localStorage.removeItem('buyer');
    localStorage.removeItem('attendees');
    try {
      await axiosInstance.delete(`/api/cart/${cartData?.id}`);
      cartMutate(undefined);
      eventMutate();
      localStorage.removeItem('cartSessionId');
      timeOut.onFalse();
    } catch (error) {
      toast.error(error?.message || 'Error remove cart', {
        variant: 'error',
      });
    }
  }, [cartData, cartMutate, timeOut, eventMutate]);

  const extendSession = useCallback(async () => {
    try {
      extend.onTrue();
      const res = await axiosInstance.patch(endpoints.cart.extendSession);

      const updatedCartData = {
        ...cartData,
        expiryDate: dayjs().add(5, 'minutes').toISOString(),
      };

      timeOut.onFalse();
      mutate(`${endpoints.cart.root}/${cartData?.id}`, updatedCartData, false);
      cartMutate(updatedCartData, false);

      toast.success(res?.data?.message);
    } catch (error) {
      toast.error(error);
    } finally {
      extend.onFalse();
    }
  }, [extend, timeOut, cartData, cartMutate]);

  const isDefaultTime = (date) => dayjs(date).format('HH:mm') === '00:00';

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
      <AppBar
        sx={{
          color: 'whitesmoke',
          p: 2,
          background: 'linear-gradient(to right, #200122, #6f0000, #200122)',
          backgroundSize: '200% auto',
          backgroundRepeat: 'repeat',
          animation: `${borderAnimation} 7s ease infinite`,

          // '::before': {
          //   content: '""',
          //   position: 'absolute',
          //   top: '-2px',
          //   left: '-2px',
          //   right: '-2px',
          //   bottom: '-2px',
          //   padding: '2px',
          //   background: 'linear-gradient(to bottom, #200122, #6f0000, #200122)',
          //   backgroundSize: '200% auto',
          //   backgroundRepeat: 'repeat',
          //   animation: `${borderAnimation} 7s linear infinite`,
          // },
        }}
        position="fixed"
      >
        <Stack
          direction="row"
          alignItems="center"
          px={{ sm: 5, md: 15 }}
          justifyContent={mdDown && 'space-between'}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: eventData?.eventSetting?.bgColor || 'transparent',
              p: 0.5,
              borderRadius: 1,
              maxHeight: { xs: 45, md: 50 },
              '& img': {
                maxHeight: { xs: '45px', md: '50px' },
                width: 'auto',
                maxWidth: '100%',
              },
            }}
          >
            {eventData?.eventSetting?.eventLogo ? (
              <Image
                src={eventData?.eventSetting?.eventLogo}
                sx={{
                  display: 'block',
                  objectFit: 'none',
                }}
              />
            ) : (
              <Image
                src="/assets/nexea.png"
                sx={{
                  display: 'block',
                  objectFit: 'none',
                }}
              />
            )}
          </Box>

          {!mdDown && (
            <Stack flexGrow={1}>
              <ListItemText
                primary={eventData?.name}
                secondary={
                  isDefaultTime(eventData?.date)
                    ? dayjs(eventData?.date).format('LL')
                    : dayjs(eventData?.date).format('LLL')
                }
                sx={{ textAlign: 'center' }}
                slotProps={{
                  secondary: {
                    variant: 'caption',
                    color: '#ccc',
                  },
                }}
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

      {/* <Box minHeight={headerRef?.current?.offsetHeight} /> */}

      <Dialog
        open={timeOut.value}
        fullScreen={!smUp}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          ...(smUp && {
            sx: {
              borderRadius: 1,
              maxHeight: 360,
              overflow: 'hidden',
            },
          }),
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
          <Box
            sx={{
              bgcolor: 'grey.800',
              color: 'common.white',
              p: 2,
              mb: 0,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="solar:alarm-broken" width={18} />
              <Typography variant="subtitle1" fontWeight={500}>
                Time Limit Reached
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2.5, textAlign: 'center' }}
            >
              Your session has expired and the tickets are no longer reserved. Please start again.
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth
                startIcon={<Iconify icon="solar:restart-bold" width={16} />}
                variant="outlined"
                size="medium"
                sx={{
                  borderRadius: 1,
                  borderColor: 'grey.400',
                  color: 'grey.700',
                  py: 0.8,
                  '&:hover': {
                    borderColor: 'grey.600',
                    bgcolor: 'grey.100',
                  },
                }}
                onClick={() => {
                  handleRemoveCart();
                }}
              >
                Start again
              </Button>
              {!cartData?.isExtended && (
                <LoadingButton
                  fullWidth
                  startIcon={<Iconify icon="mingcute:time-line" width={16} />}
                  variant="contained"
                  size="medium"
                  sx={{
                    borderRadius: 1,
                    py: 0.8,
                    bgcolor: 'grey.800',
                    '&:hover': {
                      bgcolor: 'grey.900',
                    },
                  }}
                  loading={extend.value}
                  onClick={extendSession}
                >
                  Extend 5 mins.
                </LoadingButton>
              )}
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TickerPurchaseHeader;
