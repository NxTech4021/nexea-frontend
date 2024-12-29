import React from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Table,
  Paper,
  Stack,
  Dialog,
  Avatar,
  Button,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';

import EventTicketCreateDialog from './event-ticket-create-dialog';

const EventTicketDialog = ({ open, onClose, tickets, event }) => {
  const createTicketDialog = useBoolean();

  return (
    event && (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogTitle id="tickets-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt="Event"
              src="/logo/nexea.png"
              sx={{ width: 64, height: 64, marginRight: 2 }}
            />
            <Box>
              <Typography variant="h6">{event.name}</Typography>
              <Typography variant="subtitle1">Tickets</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {tickets.length === 0 ? (
              <Typography align="center">No tickets available for this event.</Typography>
            ) : (
              <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 1, mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: 'white',
                      }}
                    >
                      <TableCell>Ticket Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Validity</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        sx={{ '&:hover': { backgroundColor: (theme) => theme.palette.grey[200] } }}
                      >
                        <TableCell>
                          <strong>{ticket.name}</strong>
                        </TableCell>
                        <TableCell>{ticket.type}</TableCell>
                        <TableCell>{ticket.validity}</TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>RM{ticket.price.toFixed(2)}</TableCell>
                        <TableCell>{ticket.quantity}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              // onClick={() => {
                              //   setCurrentTicket(ticket);
                              //   setOpenEditTicket(true);
                              // }}
                              color="primary"
                            >
                              <Iconify icon="material-symbols:edit" />
                            </IconButton>
                            <IconButton
                              // onClick={() => {
                              //   setCurrentTicket(ticket);
                              //   setOpenDeleteTicket(true);
                              // }}
                              color="error"
                            >
                              <Iconify icon="material-symbols:delete" />
                            </IconButton>
                            <IconButton
                              // onClick={() => handleToggleStatus(ticket.id)}
                              color={ticket.isActive ? 'success' : 'default'}
                            >
                              <Iconify
                                icon={
                                  ticket.isActive ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off'
                                }
                              />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => onClose()}
              sx={{
                borderRadius: 6,
                backgroundColor: '#f0f0f0',
                height: '36px',
                padding: '0 16px',
                color: '#555',
                '&:hover': {
                  backgroundColor: '#d0d0d0',
                },
              }}
            >
              Close
            </Button>
            <Button
              // onClick={() => setOpenCreateTicket(true)}
              onClick={createTicketDialog.onTrue}
              sx={{
                borderRadius: 6,
                color: 'white',
                height: '36px',
                padding: '0 16px',
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#115293',
                },
              }}
            >
              Create New Ticket
            </Button>
          </DialogActions>
        </Dialog>
        <EventTicketCreateDialog
          open={createTicketDialog.value}
          onClose={createTicketDialog.onFalse}
          event={event}
        />
      </>
    )
  );
};

export default EventTicketDialog;

EventTicketDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  tickets: PropTypes.array,
  event: PropTypes.object,
};
