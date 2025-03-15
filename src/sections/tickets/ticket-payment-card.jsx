import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { grey } from '@mui/material/colors';
import { Box, Stack, Divider, Typography, ListItemText, TextField, Button } from '@mui/material';

import { useCartStore } from 'src/utils/store';
import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';

const TicketPaymentCard = ({ cartData, mutate }) => {
  const { tickets } = useCartStore();
  const [discountCode, setDiscountCode] = useState(null);

  const subTotal = useMemo(
    () =>
      tickets.reduce((acc, cur) => acc + cur.subTotal, 0) ||
      cartData?.cartItem?.reduce((acc, sum) => acc + sum.quantity * sum.ticketType.price, 0),
    [tickets, cartData]
  );

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/cart/redeemDiscountCode', { discountCode });
      toast.success(res?.data?.message);
      mutate();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Box height={1} position="relative">
      <Stack
        sx={{
          borderRadius: 2,
          minHeight: 1,
          overflow: 'hidden',
          color: 'whitesmoke',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ bgcolor: 'black', p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="lets-icons:order-fill" width={30} />

            <ListItemText
              primary="Order Summary"
              secondary="Review Your Order."
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
            />
          </Stack>
        </Box>

        {subTotal || cartData ? (
          <Stack
            sx={{
              color: 'black',
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
              color={grey[800]}
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
                {cartData && (
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

TicketPaymentCard.propTypes = {
  cartData: PropTypes.object,
  mutate: PropTypes.func,
};
