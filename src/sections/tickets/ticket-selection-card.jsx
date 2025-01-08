import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Stack,
  Table,
  Button,
  Divider,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Typography,
  ListItemText,
  TableContainer,
} from '@mui/material';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

const fakeInfo = [
  {
    id: 1,
    type: 'Standard - Startups',
    price: 199,
    quantity: 1,
    subTotal: 0,
  },
  {
    id: 2,
    type: 'Standard - General',
    price: 499,
    quantity: 1,
    subTotal: 0,
  },
];

const fakeDiscountCode = [
  {
    code: 'AFIQXNEXEA',
    type: 'percentage',
    value: '67%',
  },
  {
    code: 'JAMESXNEXEA',
    type: 'percentage',
    value: '78%',
  },
];

const TicketSelectionCard = () => {
  const [tickets, setTickets] = useState(fakeInfo);
  const [totalPrice, setTotalPrice] = useState(null);
  const [subTotal, setSubtotal] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [discount, setDiscount] = useState(null);

  const handleIncrement = useCallback((id) => {
    setTickets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
    setTickets((items) => [
      ...items.map((item) => ({ ...item, subTotal: item.price * item.quantity })),
    ]);
  }, []);

  const handleDecrement = useCallback((id) => {
    setTickets((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity > 0 && item.quantity - 1,
            }
          : item
      )
    );
    setTickets((items) => [
      ...items.map((item) => ({ ...item, subTotal: item.price * item.quantity })),
    ]);
  }, []);

  // Delete if quantity is 0
  const handleDelete = (id) => {
    setTickets((items) => items.filter((ticket) => ticket.id !== id));
  };

  const applyDiscountCode = () => {
    if (!tickets.length) {
      enqueueSnackbar('Please select a ticket first', {
        variant: 'error',
      });
      return;
    }

    if (!discountCode) {
      enqueueSnackbar('Discount code not found.', {
        variant: 'error',
      });
      return;
    }

    const isExist = fakeDiscountCode.find((item) => item.code === discountCode);

    if (!isExist) {
      enqueueSnackbar('Discount code not found.', {
        variant: 'error',
      });
      return;
    }

    if (discount && isExist.code === discount.code) {
      enqueueSnackbar('Discount code has been applied', {
        variant: 'error',
      });
      return;
    }

    setDiscount(isExist);
    setDiscountCode('');
    enqueueSnackbar('Sucessfully applied.');
  };

  const calculateDiscountedPrice = useCallback(() => {
    console.log('calling');
    let discountPrice = 0;

    if (!!discount && subTotal) {
      discountPrice += (subTotal * parseFloat(discount.value)) / 100;
    }

    if (discountPrice > subTotal) {
      setDiscountedPrice(subTotal);
      return;
    }

    const price = tickets.reduce((acc, val) => acc + val.subTotal, 0);

    setTotalPrice(price - discountPrice);
    setDiscountedPrice(discountPrice);
  }, [discount, subTotal, tickets]);

  // Calculate price for total tickets
  useEffect(() => {
    const price = tickets.reduce((acc, val) => acc + val.subTotal, 0);
    setSubtotal(price);

    setTotalPrice(price + 11.94);
  }, [tickets, subTotal]);

  // Calculate subtotal for each ticket
  useEffect(() => {
    setTickets((items) => [
      ...items.map((item) => ({ ...item, subTotal: item.price * item.quantity })),
    ]);
  }, []);

  useEffect(() => {
    calculateDiscountedPrice();
  }, [calculateDiscountedPrice]);

  return (
    <Stack
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'white',
      }}
    >
      <Box
        sx={{
          bgcolor: 'black',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'whitesmoke',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Image src="/assets/tickets/ticket-1.svg" width={25} />
          <ListItemText
            primary="Event Ticket"
            secondary="{{ event name  }}"
            primaryTypographyProps={{ variant: 'subtitle1' }}
            secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
          />
        </Stack>
        <Typography>{`{{ event logo }}`}</Typography>
      </Box>

      <Box sx={{ px: 2 }}>
        <Box>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  '& .MuiTableCell-head': {
                    bgcolor: 'white',
                  },
                  borderBottom: 1,
                  borderBottomColor: '#EBEBEB',
                }}
              >
                <TableRow>
                  <TableCell>Ticket Type</TableCell>
                  <TableCell align="center">Ticket Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>

              <TableBody
                sx={{
                  '& .MuiTableCell-body': {
                    border: 'none',
                  },
                  borderBottom: 1,
                  borderBottomColor: '#EBEBEB',
                }}
              >
                {tickets.length > 0 &&
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.type}</TableCell>
                      <TableCell align="center">{`RM ${ticket.price}`}</TableCell>
                      <TableCell align="center">
                        {ticket.quantity === 0 ? (
                          <Stack direction="row" alignItems="center" justifyContent="center">
                            <IconButton color="error" onClick={() => handleDelete(ticket.id)}>
                              <Iconify width={15} icon="mdi-light:delete" />
                            </IconButton>
                            <IconButton onClick={() => handleIncrement(ticket.id)}>
                              <Iconify
                                icon="material-symbols:add-rounded"
                                width={15}
                                color="green"
                              />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Stack direction="row" alignItems="center" justifyContent="center">
                            <IconButton onClick={() => handleDecrement(ticket.id)}>
                              <Iconify icon="ic:round-minus" width={15} color="red" />
                            </IconButton>
                            <TextField
                              value={ticket.quantity}
                              type="number"
                              variant="outlined"
                              size="small"
                              sx={{
                                width: 50,
                                '& input': {
                                  textAlign: 'center', // Center-align the text
                                },
                              }}
                            />
                            <IconButton onClick={() => handleIncrement(ticket.id)}>
                              <Iconify
                                icon="material-symbols:add-rounded"
                                width={15}
                                color="green"
                              />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        RM {parseFloat(ticket.subTotal).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Stack
          my={2}
          direction={{ md: 'row' }}
          justifyContent="space-between"
          alignItems="start"
          gap={3}
        >
          <Stack width={1} spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TextField
                size="small"
                placeholder="Enter Discount Code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase().split(' ').join(''))}
              />
              <Button variant="contained" size="small" onClick={applyDiscountCode}>
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
          </Stack>

          <Stack
            sx={{
              '& .MuiTypography-root': {
                fontSize: 14,
                fontWeight: 500,
              },
            }}
            width={1}
            spacing={1}
            flexShrink={2}
          >
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography>Subtotal:</Typography>
              <Typography>RM {subTotal}.00</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography>Discount</Typography>
              <Typography>RM {parseFloat(discountedPrice).toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography>SST:</Typography>
              <Typography>RM 11.94</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>Total:</Typography>
              <Typography>
                RM{' '}
                {subTotal > 0 ? parseFloat(totalPrice).toFixed(2) : parseFloat(subTotal).toFixed(2)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default TicketSelectionCard;
