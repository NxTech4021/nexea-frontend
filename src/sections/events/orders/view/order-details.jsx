import useSWR from 'swr';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Paper,
  alpha,
  Alert,
  Button,
  Dialog,
  Select,
  Divider,
  Tooltip,
  MenuItem,
  Snackbar,
  Container,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  CardContent,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  ListItemText,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useOrderSearchStore } from 'src/hooks/zustand/useOrderSearch';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// Local formatCurrency function
const formatCurrency = (value) => {
  if (!value) return 'RM 0.00';
  return `RM ${Number(value).toFixed(2)}`;
};

// const OrderStatus = {
//   PAID: 'PAID',
//   PENDING: 'PENDING',
//   FAILED: 'FAILED',
// };

const getStatusConfig = (status) => {
  const statusLower = status ? status.toLowerCase() : '';

  if (statusLower === 'paid') {
    return {
      color: '#229A16',
      bgColor: '#E9FCD4',
      icon: 'eva:checkmark-circle-2-fill',
    };
  }

  if (statusLower === 'pending') {
    return {
      color: '#B78103',
      bgColor: '#FFF7CD',
      icon: 'eva:clock-fill',
    };
  }

  if (statusLower === 'failed') {
    return {
      color: '#B72136',
      bgColor: '#FFE7D9',
      icon: 'ic:outline-block',
    };
  }

  return {
    color: '#637381',
    bgColor: '#F4F6F8',
    icon: 'mdi:help-circle',
  };
};

const fakeData = [
  {
    firstName: 'asdnksahjdnaskjndkasjndjasdasdasdsadassadkjnkjnljnljknlkjnkjnkjnkjnkjnkjnkjn',
  },
  {
    firstName: 'asdsadsadasdasd',
  },
  {
    firstName: 'xcvxasdasdsa',
  },
  {
    firstName: 'qweasdasdqe',
  },
  {
    firstName: 'asdsad',
  },
  {
    firstName: 'nvbasdsadasdn',
  },
  {
    firstName: 'tyrtasdsar',
  },
];

const OrderDetails = ({ orderId }) => {
  const router = useRouter();
  const { data: order, isLoading, mutate } = useSWR(`${endpoints.order.root}/${orderId}`, fetcher);
  const { selectedEventId } = useOrderSearchStore();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const openInvoice = useBoolean();

  const attendees = order?.attendees || [];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenResendDialog = () => {
    setResendDialogOpen(true);
  };

  const handleCloseResendDialog = () => {
    setResendDialogOpen(false);
  };

  const handleOpenStatusChange = () => {
    setNewStatus(order.status?.toLowerCase() || '');
    setStatusChangeOpen(true);
  };

  const handleCloseStatusChange = () => {
    setStatusChangeOpen(false);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      const response = await axiosInstance.patch(`${endpoints.order.root}/${orderId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Order status has been updated successfully!',
          severity: 'success',
        });
        mutate(); // Refresh order data
        handleCloseStatusChange();
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to update order status. Please try again.',
        severity: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    try {
      setResendingEmail(true);
      const response = await axiosInstance.post(
        endpoints.order.payment.resendConfirmation(orderId)
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Confirmation emails have been resent successfully!',
          severity: 'success',
        });
        handleCloseResendDialog();
      } else {
        throw new Error(response.data.message || 'Failed to resend emails');
      }
    } catch (error) {
      console.error('Error resending confirmation emails:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to resend confirmation emails. Please try again.',
        severity: 'error',
      });
    } finally {
      setResendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Iconify icon="eva:alert-circle-outline" width={64} height={64} color="text.secondary" />
          <Typography variant="h5">Order not found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            The order you&apos;re looking for doesn&apos;t exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(paths.dashboard.order.root)}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        {/* <Tooltip title="Back to Orders">
          <IconButton
            onClick={() => {
              // Prioritize the stored selected event ID, then order's event ID, then fallback
              const eventIdToUse = selectedEventId || order?.event?.id;
              if (eventIdToUse) {
                router.push(paths.dashboard.order.event(eventIdToUse));
              } else {
                // Fallback to general orders page if no event ID
                router.push(paths.dashboard.order.root);
              }
            }}
            sx={{
              width: 40,
              height: 40,
              color: 'grey.800',
              bgcolor: (theme) => alpha(theme.palette.grey[800], 0.08),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[800], 0.16),
              },
            }}
          >
            <Iconify icon="eva:arrow-back-fill" width={20} height={20} />
          </IconButton>
        </Tooltip> */}

        <Tooltip title="Back to Attendees">
          <IconButton
            onClick={() => {
              const eventIdToUse = order?.event?.id || selectedEventId;

              // console.log('Navigation Debug:', {
              //   orderEventId: order?.event?.id,
              //   selectedEventId,
              //   eventIdToUse,
              //   eventName: order?.event?.name,
              // });

              if (eventIdToUse) {
                router.push(`${paths.dashboard.events.attendees}/${eventIdToUse}`);
              } else {
                // Fallback
                router.push(paths.dashboard.events.root);
              }
            }}
            sx={{
              width: 40,
              height: 40,
              color: 'grey.800',
              bgcolor: (theme) => alpha(theme.palette.grey[800], 0.08),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[800], 0.16),
              },
            }}
          >
            <Iconify icon="eva:arrow-back-fill" width={20} height={20} />
          </IconButton>
        </Tooltip>

        <CustomBreadcrumbs
          heading="Order Details"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Orders', href: paths.dashboard.order.root },
            { name: `Order #${order.orderNumber || ''}` },
          ]}
          sx={{ flexGrow: 1 }}
        />
      </Box>

      {/* Order Header Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 2,
          background: (theme) => `linear-gradient(135deg, 
            ${theme.palette.primary.main} 0%, 
            ${alpha(theme.palette.primary.darker, 0.8)} 100%)`,
          boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    Order #{order.orderNumber}
                  </Typography>
                  <Chip
                    icon={
                      <Iconify
                        icon={getStatusConfig(order.status).icon}
                        width={16}
                        height={16}
                        sx={{ color: getStatusConfig(order.status).color }}
                      />
                    }
                    label={
                      order.status
                        ? `${order.status.charAt(0).toUpperCase()}${order.status.slice(1).toLowerCase()}`
                        : 'Unknown'
                    }
                    sx={{
                      backgroundColor: getStatusConfig(order.status).bgColor,
                      color: getStatusConfig(order.status).color,
                      fontWeight: 600,
                      ml: 1,
                      pointerEvents: 'none',
                      '& .MuiChip-icon': {
                        color: `${getStatusConfig(order.status).color} !important`,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                  Created on {dayjs(order.createdAt).format('MMMM D, YYYY [at] h:mm A')}
                </Typography>
              </Stack>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            >
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {formatCurrency(order.totalAmount)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                  Total Amount
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Buyer Information */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="eva:person-outline" width={20} height={20} sx={{ color: '#000' }} />
              </Box>
              <Typography variant="h6">Buyer Information</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {/* Buyer Avatar */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {`${order.buyerName?.charAt(0) || 'B'}`}
                </Typography>
              </Box>

              {/* Buyer Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {order.buyerName}
                </Typography>

                {/* Contact Information */}
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify
                      icon="eva:email-outline"
                      width={14}
                      height={14}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {order.buyerEmail}
                    </Typography>
                  </Box>

                  {order.buyerPhoneNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify
                        icon="eva:phone-outline"
                        width={14}
                        height={14}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {order.buyerPhoneNumber}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify
                      icon="eva:clock-outline"
                      width={14}
                      height={14}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Purchased {dayjs(order.createdAt).format('MMM D, YYYY [at] h:mm A')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Paper>

          {/* Event Information */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify
                  icon="eva:calendar-outline"
                  width={20}
                  height={20}
                  sx={{ color: '#000' }}
                />
              </Box>
              <Typography variant="h6">Event Information</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {order.event ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* Event Logo */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    flexShrink: 0,
                    bgcolor: order.event?.eventSetting?.bgColor || 'background.neutral',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    component="img"
                    src={order.event?.eventSetting?.eventLogo || '/logo/nexea.png'}
                    alt={order.event?.name || 'Event'}
                    sx={{
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <Box
                    sx={{
                      display: 'none',
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <Iconify
                      icon="eva:calendar-outline"
                      width={20}
                      height={20}
                      sx={{ color: 'primary.main' }}
                    />
                  </Box>
                </Box>

                {/* Event Details */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                    {order.event.name}
                  </Typography>

                  {order.event.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {order.event.description}
                    </Typography>
                  )}

                  {/* Event Details */}
                  <Stack spacing={1}>
                    {/* Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify
                        icon="eva:calendar-outline"
                        width={14}
                        height={14}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {order.event.date
                          ? dayjs(order.event.date).format('MMM D, YYYY')
                          : 'Date not available'}
                      </Typography>
                    </Box>

                    {/* Time */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify
                        icon="eva:clock-outline"
                        width={14}
                        height={14}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {order.event.date
                          ? dayjs(order.event.date).format('h:mm A')
                          : 'Time not available'}
                        {order.event.endDate && ` - ${dayjs(order.event.endDate).format('h:mm A')}`}
                      </Typography>
                    </Box>

                    {/* Organizer */}
                    {order.event.personInCharge && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon="eva:person-outline"
                          width={14}
                          height={14}
                          sx={{ color: 'text.secondary' }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {order.event.personInCharge.fullName}
                        </Typography>
                      </Box>
                    )}

                    {/* Location */}
                    {order.event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon="eva:pin-outline"
                          width={14}
                          height={14}
                          sx={{ color: 'text.secondary' }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {order.event.location}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Iconify
                  icon="eva:calendar-outline"
                  width={32}
                  height={32}
                  sx={{ color: 'text.secondary', mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Event information not available
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Attendees */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify
                    icon="eva:people-outline"
                    width={20}
                    height={20}
                    sx={{ color: '#000' }}
                  />
                </Box>
                <Typography variant="h6">Attendees</Typography>
              </Box>
              <Chip
                size="small"
                label={`${order.attendees?.length || 0} ${(order.attendees?.length || 0) === 1 ? 'person' : 'people'}`}
                sx={{
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {order.attendees && order.attendees.length > 0 ? (
              <Stack spacing={0}>
                {order.attendees.map((attendee, index) => (
                  <Box
                    key={attendee.id}
                    sx={{
                      py: 2.5,
                      px: 0,
                      borderBottom:
                        index < order.attendees.length - 1
                          ? (theme) => `1px solid ${theme.palette.divider}`
                          : 'none',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                        borderRadius: 1,
                        mx: -1,
                        px: 1,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Avatar */}
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ color: 'primary.main', fontWeight: 700 }}
                        >
                          {`${attendee.firstName?.charAt(0) || ''}${attendee.lastName?.charAt(0) || ''}`}
                        </Typography>
                      </Box>

                      {/* Main Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
                              {`${attendee.firstName} ${attendee.lastName}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {attendee.email}
                            </Typography>
                            {attendee.phoneNumber && (
                              <Typography variant="caption" color="text.secondary">
                                {attendee.phoneNumber}
                              </Typography>
                            )}
                          </Box>

                          {/* Price */}
                          <Box sx={{ textAlign: 'right', ml: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#000' }}>
                              {formatCurrency(
                                attendee.ticket?.price || attendee.ticket?.ticketType?.price || 0
                              )}
                            </Typography>
                            {attendee.ticket?.ticketAddOn?.addOn && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                +{formatCurrency(attendee.ticket.ticketAddOn.price || 0)} add-on
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Details Row */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify
                              icon="eva:briefcase-outline"
                              width={14}
                              height={14}
                              sx={{ color: 'text.secondary' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {attendee.companyName || 'No company'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify
                              icon="eva:pricetags-outline"
                              width={14}
                              height={14}
                              sx={{ color: 'text.secondary' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {attendee?.ticket?.ticketType?.title || 'No ticket type'}
                            </Typography>
                          </Box>

                          {attendee.ticket?.ticketAddOn?.addOn && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Iconify
                                icon="eva:plus-circle-outline"
                                width={14}
                                height={14}
                                sx={{ color: 'text.secondary' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {attendee.ticket.ticketAddOn?.addOn.name}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  py: 6,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Iconify
                    icon="eva:people-outline"
                    width={24}
                    height={24}
                    sx={{ color: 'text.secondary' }}
                  />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  No attendees found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This order does not have any attendees registered
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify
                  icon="eva:shopping-cart-outline"
                  width={20}
                  height={20}
                  sx={{ color: '#000' }}
                />
              </Box>
              <Typography variant="h6">Order Summary</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify
                    icon="eva:shopping-cart-outline"
                    width={14}
                    height={14}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatCurrency(
                    (order.totalAmount - order.tax || 0) + (order.discountAmount || 0)
                  )}
                </Typography>
              </Box>

              {(order.discountCode && order.discountAmount) ||
                (order.discountAmount > 0 && (
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify
                        icon="eva:gift-outline"
                        width={14}
                        height={14}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Discount
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                      -{formatCurrency(order.discountAmount || 0)}
                    </Typography>
                  </Box>
                ))}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify
                    icon="eva:percent-outline"
                    width={14}
                    height={14}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    SST
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order.totalAmount > 0 ? formatCurrency(order.tax || 0) : formatCurrency(0)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify
                    icon="eva:credit-card-outline"
                    width={16}
                    height={16}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrency(order.totalAmount)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Payment Status */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify
                    icon="eva:credit-card-outline"
                    width={20}
                    height={20}
                    sx={{ color: '#000' }}
                  />
                </Box>
                <Typography variant="h6">Payment Status</Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="eva:edit-outline" width={16} height={16} />}
                onClick={handleOpenStatusChange}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 0.5,
                  minWidth: 'auto',
                }}
              >
                Edit
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: getStatusConfig(order.status).bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify
                  icon={getStatusConfig(order.status).icon}
                  width={20}
                  height={20}
                  sx={{ color: getStatusConfig(order.status).color }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {order.status
                    ? `${order.status.charAt(0).toUpperCase()}${order.status.slice(1).toLowerCase()}`
                    : 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.status &&
                    order.status.toLowerCase() === 'paid' &&
                    'Payment completed successfully'}
                  {order.status &&
                    order.status.toLowerCase() === 'pending' &&
                    'Awaiting payment confirmation'}
                  {order.status &&
                    order.status.toLowerCase() === 'failed' &&
                    'Payment transaction failed'}
                  {(!order.status ||
                    (order.status.toLowerCase() !== 'paid' &&
                      order.status.toLowerCase() !== 'pending' &&
                      order.status.toLowerCase() !== 'failed')) &&
                    'Status information unavailable'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Order Actions */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify
                  icon="eva:options-2-outline"
                  width={20}
                  height={20}
                  sx={{ color: '#000' }}
                />
              </Box>
              <Typography variant="h6">Order Actions</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {order.status &&
              (order.status.toLowerCase() === 'pending' ||
                order.status.toLowerCase() === 'failed' ||
                order.status.toLowerCase() === 'cancelled') ? (
                <Tooltip title="Resend only available for Paid orders">
                  <span style={{ width: '100%', cursor: 'not-allowed' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Iconify icon="eva:email-outline" width={18} height={18} />}
                      disabled
                      sx={{
                        textTransform: 'none',
                        py: 1.5,
                        borderRadius: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      Resend Confirmation Email
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  startIcon={<Iconify icon="eva:email-outline" width={18} height={18} />}
                  onClick={handleOpenResendDialog}
                  disabled={resendingEmail}
                  sx={{
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {resendingEmail ? 'Sending...' : 'Resend Confirmation Email'}
                </Button>
              )}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify
                  icon="simple-icons:quickbooks"
                  width={20}
                  height={20}
                  sx={{ color: '#000' }}
                />
              </Box>
              <Typography variant="h6">Quickbook Invoice</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                color="info"
                startIcon={<Iconify icon="mdi:invoice-send-outline" width={18} height={18} />}
                onClick={openInvoice.onTrue}
                disabled={resendingEmail}
                sx={{
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 1.5,
                  fontWeight: 500,
                }}
              >
                Manage Invoice
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog for Resending Emails */}
      <Dialog
        open={resendDialogOpen}
        onClose={handleCloseResendDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="eva:email-outline" width={20} height={20} sx={{ color: '#000' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Resend Confirmation Email
            </Typography>
          </Box>
          <Divider />
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {order && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body1" sx={{ mb: 1, mt: 2 }}>
                  Resend confirmation email for order{' '}
                  <Typography component="span" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {order.orderNumber}
                  </Typography>
                  ?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This will send confirmation emails to all recipients listed below.
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Iconify
                    icon="eva:people-outline"
                    width={16}
                    height={16}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Email Recipients ({1 + (order.attendees?.length || 0)})
                  </Typography>
                </Box>

                <Stack spacing={1}>
                  {/* Buyer Email */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {order.buyerName?.charAt(0) || 'B'}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.buyerEmail}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.buyerName} (Buyer)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Attendee Emails */}
                  {order.attendees &&
                    order.attendees.length > 0 &&
                    order.attendees.map((attendee) => (
                      <Box
                        key={attendee.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          bgcolor: 'background.neutral',
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'primary.main', fontWeight: 700 }}
                          >
                            {`${attendee.firstName?.charAt(0) || ''}${attendee.lastName?.charAt(0) || ''}`}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {attendee.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {attendee.firstName} {attendee.lastName} (Attendee)
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  bgcolor: alpha('#ffa726', 0.1),
                  borderRadius: 1,
                }}
              >
                <Iconify icon="eva:info-outline" width={16} height={16} sx={{ color: '#ffa726' }} />
                <Typography variant="caption" sx={{ color: '#ffa726', fontWeight: 500 }}>
                  Confirmation emails will be sent immediately to all recipients above.
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={handleCloseResendDialog}
            startIcon={<Iconify icon="eva:close-outline" width={18} height={18} />}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 1.5,
              px: 2,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResendConfirmationEmail}
            disabled={resendingEmail}
            variant="contained"
            color="primary"
            startIcon={
              resendingEmail ? (
                <CircularProgress size={18} thickness={4} sx={{ color: 'white' }} />
              ) : (
                <Iconify icon="eva:email-outline" width={18} height={18} />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              px: 3,
              py: 1,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {resendingEmail ? 'Sending...' : 'Send Emails'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={statusChangeOpen}
        onClose={handleCloseStatusChange}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(to bottom, #ffffff, #f9fafc)'
                : 'linear-gradient(to bottom, #1a202c, #2d3748)',
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(245, 247, 250, 0.85)'
                : 'rgba(26, 32, 44, 0.85)',
          }}
        >
          <Iconify icon="eva:edit-fill" width={28} height={28} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Change Payment Status</Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          {order && (
            <>
              <Typography variant="body1" sx={{ mb: 3, mt: 2 }}>
                <b>#{order.orderNumber}</b>
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="status-select-label">Payment Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  value={newStatus}
                  label="Payment Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="#ffa100" sx={{ mt: -1 }}>
                Note: Use this option to update the payment status of an order.
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(26, 32, 44, 0.5)',
            borderTop: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748'),
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseStatusChange}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              borderColor: (theme) => (theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568'),
              color: (theme) => (theme.palette.mode === 'light' ? '#64748b' : '#a0aec0'),
              borderWidth: '1.5px',
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(74, 85, 104, 0.2)',
                borderColor: (theme) => (theme.palette.mode === 'light' ? '#cbd5e1' : '#718096'),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={updatingStatus}
            variant="contained"
            color="primary"
            startIcon={
              updatingStatus ? (
                <CircularProgress size={20} thickness={4} />
              ) : (
                <Iconify icon="eva:save-fill" />
              )
            }
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoices dialog */}
      <Dialog
        open={openInvoice.value}
        // onClose={openInvoice.onFalse}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(to bottom, #ffffff, #f9fafc)'
                : 'linear-gradient(to bottom, #1a202c, #2d3748)',
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(245, 247, 250, 0.85)'
                : 'rgba(26, 32, 44, 0.85)',
          }}
        >
          <Iconify
            icon="iconamoon:invoice-bold"
            width={28}
            height={28}
            sx={{ color: 'primary.main' }}
          />
          <Typography variant="h6">Invoices</Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          <Box
            mt={3}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,1fr)',
              gap: 2,
            }}
          >
            {attendees.length &&
              attendees.map((attendee) => (
                <React.Fragment key={attendee.id}>
                  <ListItemText
                    primary={`${attendee.firstName} ${attendee.lastName}`}
                    secondary={attendee.email}
                    slotProps={{
                      primary: {
                        variant: 'subtitle2',
                      },
                      secondary: {
                        variant: 'caption',
                      },
                    }}
                  />

                  <Button
                    startIcon={<Iconify icon="mdi:invoice-send-outline" />}
                    sx={{ justifySelf: 'end', alignSelf: 'center' }}
                    variant="outlined"
                    size="small"
                  >
                    Send Invoice
                  </Button>
                </React.Fragment>
              ))}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(26, 32, 44, 0.5)',
            borderTop: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748'),
          }}
        >
          <Button
            variant="outlined"
            onClick={openInvoice.onFalse}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              borderColor: (theme) => (theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568'),
              color: (theme) => (theme.palette.mode === 'light' ? '#64748b' : '#a0aec0'),
              borderWidth: '1.5px',
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(74, 85, 104, 0.2)',
                borderColor: (theme) => (theme.palette.mode === 'light' ? '#cbd5e1' : '#718096'),
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

OrderDetails.propTypes = {
  orderId: PropTypes.string.isRequired,
};

export default OrderDetails;
