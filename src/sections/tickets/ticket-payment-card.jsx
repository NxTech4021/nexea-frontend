import { toast } from 'sonner';
import React, { useMemo, useState } from 'react';

import { grey } from '@mui/material/colors';
import { Box, Stack, Divider, Typography, ListItemText } from '@mui/material';

import { useCartStore } from 'src/utils/store';
import axiosInstance, { endpoints } from 'src/utils/axios';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

const TicketPaymentCard = () => {
  const { tickets } = useCartStore();

  const totalTicketsQuantitySelected = useMemo(() => {
    const ticketsTotal = tickets.reduce((acc, cur) => acc + cur.quantity, 0);
    return ticketsTotal;
  }, [tickets]);

  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);

  const subTotal = useMemo(() => tickets.reduce((acc, cur) => acc + cur.subTotal, 0), [tickets]);

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      toast.error('Please enter a discount code');
      return;
    }

    const cartSubtotal = tickets.reduce(
      (total, ticket) => total + ticket.quantity * ticket.price,
      0
    );

    const selectedTicket = tickets.find((ticket) => ticket.quantity > 0);

    if (!totalTicketsQuantitySelected) {
      toast.error('Please select at least one ticket');
      return;
    }

    const payload = {
      code_name: discountCode,
      cartSubtotal,
      ticketId: selectedTicket?.id || null,
      quantity: selectedTicket?.quantity || 0,
    };

    try {
      const response = await axiosInstance.post(endpoints.discount.redeem, payload);

      const { success, discountAmount, discountValue, discountType, message } = response.data;

      if (success) {
        setDiscount({
          code_name: discountCode,
          value: discountValue,
          type: discountType,
          amount: discountAmount,
          ticketId: selectedTicket?.id || null,
          quantity: selectedTicket?.quantity || 0,
          cartSubtotal,
        });

        toast('Discount code redeemed successfully');
      } else {
        toast.error(message || 'Failed to apply discount');
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.message || 'Invalid Discount code');
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
          <Stack direction="row" alignItems="center" spacing={2}>
            <Image src="/assets/tickets/ticket-3.svg" width={25} />
            <ListItemText
              primary="Payment"
              secondary="All transactions are secure and encrypted."
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
            />
          </Stack>
        </Box>

        {subTotal ? (
          <Stack
            sx={{
              color: 'black',
              p: 2,
              px: 3,
              flex: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Order Summary
            </Typography>

            <Stack
              sx={{
                '& .MuiTypography-root': {
                  fontSize: 14,
                  fontWeight: 400,
                },
                textWrap: 'nowrap',
              }}
              mt={3}
              width={1}
              spacing={2}
              flexShrink={2}
              color={grey[800]}
              flex={1}
              justifyContent="space-between"
            >
              <Box>
                <Stack spacing={2}>
                  {tickets
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
                {/* <Stack spacing={1}>
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

                  {!!discount && (
                    <Stack maxWidth={200} spacing={1}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Iconify icon="lets-icons:check-fill" color="success.main" width={13} />
                        <Typography variant="caption" fontSize={12} color="success">
                          Discount code applied
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" fontSize={12}>
                          {discount.code}
                        </Typography>
                        <Typography variant="caption" color="error" fontSize={12}>
                          - {discount.value}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack> */}

                <Divider />

                <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                  <Typography>Subtotal:</Typography>
                  <Typography>
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      subTotal
                    )}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                  <Typography>Discount</Typography>
                  <Typography>
                    - {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(0)}
                  </Typography>
                </Stack>
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
                    '& .MuiTypography-root': {
                      fontSize: 20,
                      fontWeight: 600,
                    },
                  }}
                >
                  <Typography>Total:</Typography>
                  <Typography>
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(200)}
                    {/* {subTotal > 0 ? parseFloat(totalPrice).toFixed(2) : parseFloat(subTotal).toFixed(2)} */}
                  </Typography>
                </Stack>
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
