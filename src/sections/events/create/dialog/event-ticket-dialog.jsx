import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import useSWR from 'swr';

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
  Divider,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import CreateTicketTypeDialog from 'src/sections/events/ticket-types/dialog/create';
import { createTicketType } from 'src/api/ticket-type';
import { useAddOnsStore } from 'src/sections/events/ticket-types/hooks/use-add-on';
import axiosInstance, { endpoints } from 'src/utils/axios';

const fetcher = async (url) => {
  const response = await axiosInstance.get(url);
  return response.data;
};

const EventTicketDialog = ({ open, onClose, tickets: initialTickets, event }) => {
  const createTicketDialog = useBoolean();
  const { selectedAddOns } = useAddOnsStore();
  const [tickets, setTickets] = useState(initialTickets || []);
  const [isLoading, setIsLoading] = useState(false);

  // Use SWR to fetch event details and tickets
  const { data: eventData, error: eventError, mutate } = useSWR(
    open && event?.id ? `${endpoints.events.root}/${event.id}` : null,
    fetcher
  );

  // Update tickets whenever SWR data changes
  useEffect(() => {
    if (eventData) {
      console.log('Event data from SWR:', eventData);
      if (eventData.ticketType) {
        setTickets(eventData.ticketType);
      } else if (eventData.tickets) {
        setTickets(eventData.tickets);
      }
    }
  }, [eventData]);

  // Manual refresh function using SWR mutate
  const refreshTickets = useCallback(() => {
    if (!event?.id) return;
    setIsLoading(true);
    
    mutate()
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error refreshing tickets:', error);
        enqueueSnackbar('Failed to refresh ticket list', { variant: 'error' });
        setIsLoading(false);
      });
  }, [event?.id, mutate]);

  // Update local tickets when the dialog opens or initialTickets change
  useEffect(() => {
    if (open && initialTickets) {
      setTickets(initialTickets);
    }
  }, [open, initialTickets]);

  const TicketSchema = Yup.object().shape({
    eventId: Yup.string().required('Event is required'),
    type: Yup.string().required('Type is required'),
    category: Yup.string().required('Category is required'),
    title: Yup.string().required('Title is required'),
    price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
    quantity: Yup.number().integer().min(1, 'Quantity must be at least 1').required('Quantity is required'),
    description: Yup.string().required('Description is required'),
    requirement: Yup.object().shape({
      minimumTicketPerOrder: Yup.number().integer().min(0),
      maximumTicketPerOrder: Yup.number().integer().min(0),
    }),
  });

  const methods = useForm({
    resolver: yupResolver(TicketSchema),
    defaultValues: {
      eventId: event?.id || '',
      type: '',
      category: '',
      title: '',
      price: '',
      quantity: 1,
      description: '',
      requirement: {
        minimumTicketPerOrder: 1,
        maximumTicketPerOrder: 10,
      },
    },
  });

  const resetForm = () => {
    methods.reset({
      eventId: event?.id || '',
      type: '',
      category: '',
      title: '',
      price: '',
      quantity: 1,
      description: '',
      requirement: {
        minimumTicketPerOrder: 1,
        maximumTicketPerOrder: 10,
      },
    });
  };

  const handleSubmitTicket = methods.handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      const newTicketType = {
        title: data.title,
        type: data.type,
        eventId: data.eventId,
        category: data.category,
        description: data.description,
        validity: data.validity || null,
        price: parseFloat(data.price),
        quantity: data.quantity,
        minimumTicketPerOrder: parseInt(data.requirement.minimumTicketPerOrder, 10),
        maximumTicketPerOrder: parseInt(data.requirement.maximumTicketPerOrder, 10),
        selectedAddOns: selectedAddOns?.length ? selectedAddOns : null,
      };

      console.log('Submitting ticket data:', newTicketType);
      await createTicketType(newTicketType);
      
      // Close just the create ticket dialog, not the main dialog
      createTicketDialog.onFalse();
      
      // Reset the form for next ticket creation
      resetForm();
      
      enqueueSnackbar('Ticket type created successfully!', { variant: 'success' });
      
      // Optimistically add the new ticket to the list
      const tempTicket = {
        id: `temp-${Date.now()}`,
        name: newTicketType.title,
        title: newTicketType.title,
        type: newTicketType.type,
        category: newTicketType.category,
        price: newTicketType.price,
        quantity: newTicketType.quantity,
        validity: newTicketType.validity,
        isActive: true
      };
      
      setTickets(prev => [...prev, tempTicket]);
      
      // Wait a moment for the backend to process before refreshing the real data
      setTimeout(() => {
        refreshTickets();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      enqueueSnackbar(error.message || 'Failed to create ticket type', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  });

  // Mock data for development
  const eventsData = {
    events: [
      {
        id: event?.id || '1',
        name: event?.name || 'Current Event',
      },
    ],
  };

  return (
    event && (
      <>
        <Dialog 
          open={open} 
          onClose={onClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: { 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => 
                theme.palette.mode === 'light' 
                  ? 'linear-gradient(to bottom, #ffffff, #f9fafc)'
                  : 'linear-gradient(to bottom, #1a202c, #2d3748)'
            }
          }}
        >
          <DialogTitle 
            id="tickets-dialog-title" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              py: 3,
              px: 4,
              backgroundColor: (theme) => 
                theme.palette.mode === 'light'
                  ? 'rgba(245, 247, 250, 0.85)'
                  : 'rgba(26, 32, 44, 0.85)'
            }}
          >
            <Avatar
              alt="Event"
              src="/logo/nexea.png"
              sx={{ 
                width: 58, 
                height: 58, 
                marginRight: 2.5,
                border: (theme) => `3px solid ${theme.palette.background.paper}`,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'light' ? '#f0f4f8' : '#2d3748'
              }}
            />
            <Box>
              <Typography 
                variant="h5" 
                fontWeight="700" 
                sx={{ 
                  color: (theme) => theme.palette.text.primary,
                  letterSpacing: '-0.3px',
                  mb: 0.5
                }}
              >
                {event.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}
              >
                <Box component="span" sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: event.status === 'INACTIVE' ? '#B72136' : '#34c759', 
                  display: 'inline-block',
                  mr: 1
                }} />
                Event Tickets {isLoading && (
                  <IconButton size="small" sx={{ ml: 1, width: 24, height: 24 }} disabled>
                    <Iconify icon="mdi:loading" sx={{ 
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': {
                          transform: 'rotate(0deg)',
                        },
                        '100%': {
                          transform: 'rotate(360deg)',
                        },
                      },
                    }} />
                  </IconButton>
                )}
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ 
            p: 4, 
            backgroundColor: (theme) => theme.palette.background.paper 
          }}>
            {tickets.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  borderRadius: 2,
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.5)',
                }}
              >
                {isLoading ? (
                  <Typography 
                    align="center" 
                    sx={{ 
                      color: (theme) => theme.palette.text.secondary,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    <Iconify 
                      icon="mdi:loading" 
                      sx={{ 
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': {
                            transform: 'rotate(0deg)',
                          },
                          '100%': {
                            transform: 'rotate(360deg)',
                          },
                        },
                      }} 
                    />
                    Loading tickets...
                  </Typography>
                ) : (
                  <>
                    <Iconify 
                      icon="mdi:ticket-outline" 
                      width={50} 
                      height={50} 
                      sx={{ 
                        color: (theme) => theme.palette.text.secondary,
                        opacity: 0.5,
                        mb: 2 
                      }} 
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: (theme) => theme.palette.text.primary,
                        mb: 1
                      }}
                    >
                      No Tickets Available
                    </Typography>
                    <Typography 
                      sx={{ 
                        color: (theme) => theme.palette.text.secondary,
                        maxWidth: 400,
                        mx: 'auto'
                      }}
                    >
                      This event does not have any tickets yet. Create a new ticket to get started.
                    </Typography>
                  </>
                )}
              </Box>
            ) : (
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  mb: 2,
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568',
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'light' 
                            ? 'rgba(247, 250, 252, 0.85)' 
                            : 'rgba(45, 55, 72, 0.85)',
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          color: (theme) => theme.palette.text.primary, 
                          py: 2
                        }}
                      >
                        Ticket Name
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          color: (theme) => theme.palette.text.primary, 
                          py: 2
                        }}
                      >
                        Type
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          color: (theme) => theme.palette.text.primary, 
                          py: 2
                        }}
                      >
                        Validity
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          color: (theme) => theme.palette.text.primary, 
                          py: 2
                        }}
                      >
                        Category
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          color: (theme) => theme.palette.text.primary, 
                          py: 2
                        }}
                      >
                        Price
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          color: (theme) => theme.palette.text.primary, 
                          py: 2
                        }}
                      >
                        Quantity
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          color: (theme) => theme.palette.text.primary, 
                          py: 2
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((ticket, index) => (
                      <TableRow
                        key={ticket.id || `ticket-${ticket.title || ticket.name}-${Math.random()}`}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(45, 55, 72, 0.3)'
                          },
                          backgroundColor: (theme) => {
                            if (index % 2 === 0) {
                              return 'transparent';
                            }
                            return theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(45, 55, 72, 0.2)';
                          },
                          borderBottom: '1px solid',
                          borderColor: (theme) => theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748',
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            color: (theme) => theme.palette.text.primary,
                            fontWeight: 500
                          }}
                        >
                          {ticket.title || ticket.name}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: (theme) => theme.palette.text.secondary,
                          }}
                        >
                          {ticket.type}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: (theme) => theme.palette.text.secondary,
                          }}
                        >
                          {ticket.validity || '-'}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: (theme) => theme.palette.text.secondary,
                          }}
                        >
                          {ticket.category}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: (theme) => theme.palette.text.primary,
                            fontWeight: 500
                          }}
                        >
                          RM{(Number(ticket.price) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: (theme) => theme.palette.text.secondary,
                          }}
                        >
                          {ticket.quantity}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              color="primary"
                              sx={{
                                width: 30,
                                height: 30,
                                backgroundColor: (theme) => 
                                  theme.palette.mode === 'light' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.2)',
                                '&:hover': {
                                  backgroundColor: (theme) => 
                                    theme.palette.mode === 'light' ? 'rgba(66, 153, 225, 0.2)' : 'rgba(66, 153, 225, 0.3)',
                                }
                              }}
                            >
                              <Iconify icon="material-symbols:edit" width={18} />
                            </IconButton>
                            <IconButton 
                              color="error"
                              sx={{
                                width: 30,
                                height: 30,
                                backgroundColor: (theme) => 
                                  theme.palette.mode === 'light' ? 'rgba(245, 101, 101, 0.1)' : 'rgba(245, 101, 101, 0.2)',
                                '&:hover': {
                                  backgroundColor: (theme) => 
                                    theme.palette.mode === 'light' ? 'rgba(245, 101, 101, 0.2)' : 'rgba(245, 101, 101, 0.3)',
                                }
                              }}
                            >
                              <Iconify icon="material-symbols:delete" width={18} />
                            </IconButton>
                            <IconButton
                              color={ticket.isActive ? 'success' : 'default'}
                              sx={{
                                width: 30,
                                height: 30,
                                backgroundColor: (theme) => {
                                  if (ticket.isActive) {
                                    return theme.palette.mode === 'light' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(72, 187, 120, 0.2)';
                                  }
                                  return theme.palette.mode === 'light' ? 'rgba(160, 174, 192, 0.1)' : 'rgba(160, 174, 192, 0.2)';
                                },
                                '&:hover': {
                                  backgroundColor: (theme) => {
                                    if (ticket.isActive) {
                                      return theme.palette.mode === 'light' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(72, 187, 120, 0.3)';
                                    }
                                    return theme.palette.mode === 'light' ? 'rgba(160, 174, 192, 0.2)' : 'rgba(160, 174, 192, 0.3)';
                                  },
                                }
                              }}
                            >
                              <Iconify
                                icon={
                                  ticket.isActive ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off'
                                }
                                width={22}
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
            
            {tickets.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  onClick={refreshTickets}
                  startIcon={<Iconify icon="mdi:refresh" />}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 2,
                    padding: '8px 16px',
                    fontWeight: 500,
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'light' ? 'rgba(237, 242, 247, 0.8)' : 'rgba(45, 55, 72, 0.5)',
                    color: (theme) => theme.palette.text.primary,
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568',
                    '&:hover': {
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(45, 55, 72, 0.8)',
                    },
                  }}
                >
                  Refresh
                </Button>
              </Box>
            )}
          </DialogContent>

          <DialogActions 
            sx={{ 
              p: 3, 
              backgroundColor: (theme) => 
                theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(26, 32, 44, 0.5)',
              borderTop: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748',
            }}
          >
            <Button
              onClick={() => onClose()}
              sx={{
                borderRadius: 4,
                height: '46px',
                padding: '0 24px',
                fontWeight: 600,
                borderColor: (theme) => theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568',
                color: (theme) => theme.palette.mode === 'light' ? '#64748b' : '#a0aec0',
                borderWidth: '1.5px',
                letterSpacing: '0.3px',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'light' 
                    ? '#f8fafc' 
                    : 'rgba(74, 85, 104, 0.2)',
                  borderColor: (theme) => theme.palette.mode === 'light' 
                    ? '#cbd5e1' 
                    : '#718096',
                },
              }}
              variant="outlined"
            >
              Close
            </Button>
            <Button
              onClick={createTicketDialog.onTrue}
              sx={{
                borderRadius: 4,
                height: '46px',
                padding: '0 28px',
                fontWeight: 600,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'light' ? '#38bdf8' : '#3182ce',
                color: 'white',
                textTransform: 'none',
                fontSize: '0.95rem',
                letterSpacing: '0.3px',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'light' ? '#0ea5e9' : '#2b6cb0',
                  boxShadow: 'none',
                },
              }}
              variant="contained"
            >
              Create New Ticket
            </Button>
          </DialogActions>
        </Dialog>

        <FormProvider {...methods}>
          <CreateTicketTypeDialog
            openDialog={createTicketDialog.value}
            onClose={createTicketDialog.onFalse}
            onSubmit={handleSubmitTicket}
            eventsData={eventsData}
          />
        </FormProvider>
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
