import React, { useState } from 'react';

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
    quantity: 0,
    subTotal: 0,
  },
  {
    id: 2,
    type: 'Standard - General',
    price: 499,
    quantity: 0,
    subTotal: 0,
  },
];

const TicketSelectionCard = () => {
  const [tickets, setTickets] = useState(fakeInfo);

  const handleIncrement = (id) => {
    setTickets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const handleDecrement = (id) => {
    setTickets((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity > 0 && item.quantity - 1 } : item
      )
    );
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
                            <Iconify icon="material-symbols:add-rounded" width={15} color="green" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{ticket.subTotal}</TableCell>
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
          <Stack direction="row" alignItems="center" spacing={1} width={1}>
            <TextField size="small" placeholder="Enter Discount Code" />
            <Button variant="contained" size="small">
              Apply
            </Button>
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
              <Typography>RM 698.00</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography>Discount</Typography>
              <Typography>RM 0.00</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography>SST:</Typography>
              <Typography>RM 11.94</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>Total:</Typography>
              <Typography>RM 19.11</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default TicketSelectionCard;
