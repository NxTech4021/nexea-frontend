import React from 'react';

import { grey } from '@mui/material/colors';
import { Box, Stack, Button, Divider, Typography, ListItemText } from '@mui/material';

import { useCartStore } from 'src/utils/store';

import Iconify from 'src/components/iconify';

const TicketPaymentCard = () => {
  const { tickets } = useCartStore();

  const subTotal = useMemo(() => tickets.reduce((acc, cur) => acc + cur.subTotal, 0), [tickets]);

  return (
    <Box height={1} position="relative">
      <Stack
        sx={{
          borderRadius: 2,
          height: 1,
          overflow: 'hidden',
          color: 'whitesmoke',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ bgcolor: 'black', p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* <Image src="/assets/tickets/ticket-3.svg" width={25} /> */}
            <Iconify icon="lets-icons:order-fill" width={35} />
            <ListItemText
              primary="Order Summary"
              secondary="Review Your Order."
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
            />
          </Stack>
        </Box>
        {subTotal ? (
          <Box sx={{ color: 'black', p: 2, px: 3 }}>
            <Stack
              sx={{
                '& .MuiTypography-root': {
                  fontSize: 14,
                  fontWeight: 400,
                },
                textWrap: 'nowrap',
              }}
              width={1}
              spacing={2}
              flexShrink={2}
              color={grey[800]}
            >
              <Stack spacing={2}>
                {tickets
                  .filter((ticket) => ticket.quantity > 0)
                  .map((ticket) => (
                    <Stack
                      key={ticket.id}
                      direction={{ xs: 'column', lg: 'row' }}
                      alignItems={{ xs: 'start', lg: 'center' }}
                      spacing={1}
                      justifyContent="space-between"
                    >
                      <Typography>{`${ticket.quantity} x ${ticket.title}`}</Typography>
                      <Typography>
                        {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                          ticket.subTotal
                        )}
                      </Typography>
                    </Stack>
                  ))}
              </Stack>

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
                  {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(0)}
                </Typography>
                {/* <Typography>RM {parseFloat(discountedPrice).toFixed(2)}</Typography> */}
              </Stack>
              <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                <Typography>SST:</Typography>
                <Typography>
                  {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(11.94)}
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
                </Typography>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Box position="absolute" top="50%" left="50%" sx={{ transform: 'translate(-50%, -50%)' }}>
            <Iconify icon="mdi:cart-outline" width={40} color={grey[300]} />
          </Box>
        )}
      </Stack>

      <Box position="absolute" bottom={10} width={1} px={1}>
        <Button variant="outlined" fullWidth size="large" color="black">
          Proceed to payment
        </Button>
      </Box>
    </Box>
  );
};

export default TicketPaymentCard;
