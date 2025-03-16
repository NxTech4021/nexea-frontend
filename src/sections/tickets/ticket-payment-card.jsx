import { toast } from 'sonner';
import React, { useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { grey } from '@mui/material/colors';
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  Collapse,
  TextField,
  Typography,
  ListItemText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';
import { useCartStore } from 'src/utils/store';

import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

const TicketPaymentCard = () => {
  const { tickets } = useCartStore();
  const [discountCode, setDiscountCode] = useState(null);
  const mdDown = useResponsive('down', 'md');
  const { data: cartData, cartMutate, handleCheckout } = useGetCartData();
  const tixs = useCartStore((state) => state.tickets);
  const collapse = useBoolean();

  const subTotal = useMemo(
    () =>
      tickets.reduce((acc, cur) => acc + cur.subTotal, 0) ||
      cartData?.cartItem?.reduce((acc, sum) => acc + sum.quantity * sum.ticketType.price, 0),
    [tickets, cartData]
  );

  const totalTicketsQuantitySelected = useMemo(() => {
    const ticketsTotal = tixs.reduce((acc, cur) => acc + cur.selectedQuantity, 0);
    return ticketsTotal;
  }, [tixs]);

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/cart/redeemDiscountCode', { discountCode });
      toast.success(res?.data?.message);
      cartMutate();
    } catch (error) {
      toast.error(error);
    }
  };

  if (mdDown) {
    return (
      <Box
        component={Card}
        p={1}
        boxShadow={10}
        minHeight={100}
        sx={{
          ...(mdDown && {
            borderTop: 1.5,
            boxShadow: 2,
            borderColor: (theme) => theme.palette.divider,
            borderRadius: '10px 10px 0 0',
          }),
        }}
      >
        <Collapse in={collapse.value} timeout="auto">
          <Box sx={{ height: '30vh', p: 1 }} position="relative">
            {!totalTicketsQuantitySelected ? (
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                color="text.secondary"
              >
                No tickets selected
              </Typography>
            ) : (
              <Stack height={1}>
                <Typography mb={2} variant="subtitle2">
                  Order Summary
                </Typography>
                <Stack
                  spacing={1}
                  flexGrow={1}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: 16,
                      fontWeight: 500,
                    },
                  }}
                >
                  {tixs
                    .filter((ticket) => ticket.selectedQuantity > 0)
                    .map((ticket) => (
                      <Stack
                        key={ticket.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        // "&"
                      >
                        <Typography>{`${ticket.selectedQuantity} x ${ticket.title}`}</Typography>
                        <Typography>
                          {Intl.NumberFormat('en-MY', {
                            style: 'currency',
                            currency: 'MYR',
                          }).format(ticket.subTotal)}
                        </Typography>
                      </Stack>
                    ))}
                </Stack>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={10}
                    justifyContent="space-between"
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: 16,
                        fontWeight: 500,
                      },
                    }}
                  >
                    <Typography>SST:</Typography>
                    <Typography>
                      {Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: 'MYR',
                      }).format(11.94)}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={10}
                    justifyContent="space-between"
                    sx={{
                      '&  .MuiTypography-root': {
                        fontSize: 20,
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Typography>Total:</Typography>
                    <Typography>
                      {Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: 'MYR',
                      }).format(subTotal && subTotal + 11.94)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Box>
        </Collapse>

        <Box my={1} onClick={() => collapse.onToggle()}>
          <Stack direction="row" alignItems="center" justifyContent="end" spacing={2}>
            {collapse.value ? (
              <Iconify icon="iconamoon:arrow-up-2-bold" width={24} />
            ) : (
              <Iconify icon="iconamoon:arrow-down-2-bold" width={24} />
            )}
            <Typography
              variant="subtitle1"
              textAlign="end"
              fontSize={18}
              fontWeight={600}
              letterSpacing={-0.7}
            >
              {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                (subTotal && subTotal + 11.94) || 0
              )}
            </Typography>
          </Stack>
        </Box>

        {cartData ? (
          <LoadingButton
            variant="contained"
            startIcon={<Iconify icon="fluent:payment-16-filled" width={20} sx={{ mr: 1 }} />}
            onClick={() => {
              const a = document.createElement('a');
              a.href = 'https://api.payex.io/Payment/Form/95697b93ae784cab990a433d1f5b7b4b';
              // a.target = '_blank';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          >
            Proceed to payment
          </LoadingButton>
        ) : (
          <LoadingButton
            variant="contained"
            size="large"
            fullWidth
            onClick={handleCheckout}
            startIcon={
              <Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />
            }
          >
            Check out
          </LoadingButton>
        )}
      </Box>
    );
  }

  return (
    <Box height={1} position="relative">
      <Stack
        component={Card}
        sx={{
          borderRadius: 2,
          minHeight: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ bgcolor: 'black', p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="lets-icons:order-fill" width={30} color="white" />

            <ListItemText
              primary="Order Summary"
              secondary="Review Your Order."
              primaryTypographyProps={{ variant: 'subtitle1', color: 'white' }}
              secondaryTypographyProps={{ variant: 'caption', color: 'white' }}
            />
          </Stack>
        </Box>

        {subTotal || cartData ? (
          <Stack
            sx={{
              // color: 'black',
              p: 2,
              px: 3,
              flex: 1,
            }}
          >
            <Stack
              sx={{
                '& .MuiTypography-root': {
                  fontSize: 14,
                  fontWeight: 400,
                },
                textWrap: 'nowrap',
              }}
              mt={2}
              width={1}
              spacing={2}
              flexShrink={2}
              // color={grey[800]}
              flex={1}
              justifyContent="space-between"
            >
              <Box>
                <Stack spacing={2}>
                  {cartData
                    ? cartData.cartItem.map((item) => (
                        <Stack
                          key={item.id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography>{`${item.quantity} x ${item.ticketType.title}`}</Typography>
                          <Typography>
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(item.quantity * item.ticketType.price)}
                          </Typography>
                        </Stack>
                      ))
                    : tickets
                        .filter((ticket) => ticket.selectedQuantity > 0)
                        .map((ticket) => (
                          <Stack
                            key={ticket.id}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography>{`${ticket.selectedQuantity} x ${ticket.title}`}</Typography>
                            <Typography>
                              {Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: 'MYR',
                              }).format(ticket.subTotal)}
                            </Typography>
                          </Stack>
                        ))}
                </Stack>
              </Box>

              <Stack spacing={2}>
                {cartData && (
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Enter Discount Code"
                        value={discountCode}
                        onChange={(e) =>
                          setDiscountCode(e.target.value.toUpperCase().split(' ').join(''))
                        }
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleRedeemDiscount}
                        sx={{ height: 36 }}
                      >
                        Apply
                      </Button>
                    </Stack>

                    {!!cartData.discount && (
                      <Stack maxWidth={200} spacing={1}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Iconify icon="lets-icons:check-fill" color="success.main" width={13} />
                          <Typography variant="caption" fontSize={12} color="success">
                            Discount code applied
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" fontSize={12}>
                            {cartData.discount.code}
                          </Typography>
                          <Typography variant="caption" color="error" fontSize={12}>
                            - {cartData.discount.value}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                )}

                <Divider />

                <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                  <Typography>Subtotal:</Typography>
                  <Typography>
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      subTotal
                    )}
                  </Typography>
                </Stack>

                {cartData && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={10}
                    justifyContent="space-between"
                  >
                    <Typography>Discount</Typography>
                    <Typography>
                      -{' '}
                      {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                        cartData?.orderSummary?.discount
                      )}
                    </Typography>
                  </Stack>
                )}

                <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                  <Typography>SST:</Typography>
                  <Typography>
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      11.94
                    )}
                  </Typography>
                </Stack>
                <Divider />
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={10}
                  justifyContent="space-between"
                  sx={{
                    '&  .MuiTypography-root': {
                      fontSize: 20,
                      fontWeight: 600,
                    },
                  }}
                >
                  <Typography>Total:</Typography>
                  <Typography>
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      cartData?.orderSummary?.totalPrice
                        ? cartData.orderSummary.totalPrice + 11.94
                        : subTotal + 11.94
                    )}
                  </Typography>
                </Stack>

                {cartData ? (
                  <LoadingButton
                    variant="contained"
                    startIcon={
                      <Iconify icon="fluent:payment-16-filled" width={20} sx={{ mr: 1 }} />
                    }
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = 'https://api.payex.io/Payment/Form/95697b93ae784cab990a433d1f5b7b4b';
                      // a.target = '_blank';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    Proceed to payment
                  </LoadingButton>
                ) : (
                  <LoadingButton
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleCheckout}
                    startIcon={
                      <Iconify
                        icon="material-symbols-light:shopping-cart-checkout-rounded"
                        width={22}
                      />
                    }
                  >
                    Check out
                  </LoadingButton>
                )}
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <Box position="absolute" top="50%" left="50%" sx={{ transform: 'translate(-50%, -50%)' }}>
            <Iconify icon="mdi:cart-outline" width={40} color={grey[300]} />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default TicketPaymentCard;
