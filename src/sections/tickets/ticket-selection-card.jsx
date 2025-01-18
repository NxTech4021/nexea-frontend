import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance, {endpoints} from 'src/utils/axios';


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




const TicketSelectionCard = ({ eventData }) => {
  const [tickets, setTickets] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [subTotal, setSubtotal] = useState(0); // The subtotal without discount
  const [discountedPrice, setDiscountedPrice] = useState(0); 
  const [sst, setSST] = useState(11.94);
  const [totalPrice, setTotalPrice] = useState(null); 

  const handleTicketSelect = (ticketId) => {
    setSelectedTicketId(ticketId);
  };

  useEffect(() => {
    if (eventData?.ticketType?.length > 0) {
      const initializedTickets = eventData.ticketType.map((ticket) => ({
        id: ticket.id,
        type: ticket.type,
        price: ticket.price,
        quantity: 0, 
      }));
      setTickets(initializedTickets);
    }
  }, [eventData]);

  useEffect(() => {
    const initialSubtotal = tickets.reduce((acc, ticket) => acc + ticket.quantity * ticket.price, 0);
  
    console.log('Initial Subtotal:', initialSubtotal);
  
    // Set the initial subtotal and total price before applying any discount
    setSubtotal(initialSubtotal);
    setTotalPrice(initialSubtotal + sst); 
    console.log('Initial Total:', initialSubtotal + sst);
    // Reset the discounted price to 0 initially
    setDiscountedPrice(0); 
  }, [tickets]); // This runs whenever `tickets` change
  
  // This effect applies the discount to the selected ticket type
  useEffect(() => {
    console.log('Discount Object:', discount);
    if (discount && discount.value && subTotal > 0) {
      console.log('Discount Object:', discount);

      let discountAppliedToTicketSubtotal = 0;
      let fullPriceSubtotal = 0;
  
      tickets.forEach(ticket => {
        if (ticket.id === discount.ticketId && discount) {
          // Apply discount to the ticket with the discount code
          if (discount.type === 'percentage') {
            discountAmount = (ticket.price * discount.value) / 100 * ticket.quantity;
          } else if (discount.type === 'fixed') {
            discountAmount = discount.value * ticket.quantity;
          }
          // Subtotal for this ticket type after discount
          discountAppliedToTicketSubtotal = (ticket.price * ticket.quantity) - discount.value;
        } else {
          // For other tickets, keep the full price
          fullPriceSubtotal += ticket.price * ticket.quantity;
        }
      });

  
      // Final subtotal after applying the discount to the selected ticket type
      const finalSubtotal = fullPriceSubtotal + discountAppliedToTicketSubtotal;
  
      // Update the total price by adding the fixed SST
      const discountedTotalPrice = finalSubtotal + sst;
  
      setDiscountedPrice(finalSubtotal); // Set the discounted subtotal
      setTotalPrice(discountedTotalPrice); // Set the total price with SST
    }
  }, [discount, subTotal, tickets]); 

  const handleIncrement = (ticketId) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, quantity: ticket.quantity + 1 }
          : ticket
      )
    );
  };

  const handleDecrement = (ticketId) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId && ticket.quantity > 0
          ? { ...ticket, quantity: ticket.quantity - 1 }
          : ticket
      )
    );
  };

  const handleDelete = (ticketId) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, quantity: 0 } : ticket
      )
    );
  };

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      enqueueSnackbar('Please enter a discount code', { variant: 'error' });
      return;
    }

    const selectedTicket = tickets.find((ticket) => ticket.quantity > 0);
    if (!selectedTicket) {
      enqueueSnackbar('Please select at least one ticket', { variant: 'error' });
      return;
    }

    const payload = {
      code_name: discountCode,
      ticketId: selectedTicket.id,
      quantity: selectedTicket.quantity,
    };

    try {
      const response = await axiosInstance.post(endpoints.discount.redeem, payload);

      const { success, discountAmount, newPrice, message } = response.data;

      if (success) {
        setDiscount({
          code: discountCode,
          value: discountAmount,  
          ticketId: selectedTicket.id,
        });
        setDiscountedPrice(discountAmount); 
        enqueueSnackbar('Discount code redeemed successfully', { variant: 'success' });
      } else {
        enqueueSnackbar(message || 'Failed to apply discount', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Invalid Discount code', { variant: 'error' });
    }
  };
  
  
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
            secondary= {eventData.name}
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
                            textAlign: 'center', 
                          },
                        }}
                        inputProps={{ readOnly: true }}
                      />
                      <IconButton onClick={() => handleIncrement(ticket.id)}>
                        <Iconify icon="material-symbols:add-rounded" width={15} color="green" />
                      </IconButton>
                    </Stack>
                  </TableCell>

                    <TableCell align="right">
                      RM {parseFloat((ticket.quantity * ticket.price).toFixed(2))}
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
              <Button variant="contained" size="small" onClick={handleRedeemDiscount}>
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
                   - {discount.value} {discount.type === 'percentage' ? '%' : 'RM'}
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
              <Typography>RM {parseFloat(subTotal).toFixed(2)}</Typography> 
            </Stack>
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography>Discount:</Typography>
              {discount && discount.value ? (
                <Typography>
                  RM {discount.value}
                </Typography>
              ) : (
                <Typography>RM 0.00</Typography>
              )}
            </Stack>
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography>SST:</Typography>
              <Typography>{sst}</Typography> 
            </Stack>
            <Divider />
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>Total:</Typography>
              <Typography>
                RM{' '}
                {subTotal > 0
                  ? parseFloat(totalPrice).toFixed(2)
                  : parseFloat(subTotal).toFixed(2)} {/* Display Total Price */}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default TicketSelectionCard;
