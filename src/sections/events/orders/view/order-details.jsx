import useSWR from 'swr';
import dayjs from 'dayjs';
import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  Chip,
  List,
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
  ListItem,
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
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

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

const OrderDetails = ({ orderId }) => {
  const router = useRouter();
  const { data: order, isLoading, mutate } = useSWR(`${endpoints.order.root}/${orderId}`, fetcher);
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
        <Tooltip title="Back to Orders">
          <IconButton
            onClick={() => router.push(paths.dashboard.order.root)}
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Buyer Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {order.buyerName}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="subtitle1">{order.buyerEmail}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="subtitle1">{order.buyerPhoneNumber || 'N/A'}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Date
                  </Typography>
                  <Typography variant="subtitle1">
                    {dayjs(order.createdAt).format('MMM D, YYYY, h:mm A')}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Event Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1.5,
                  }}
                >
                  <Iconify
                    icon="eva:calendar-fill"
                    width={28}
                    height={28}
                    sx={{ color: 'primary.main' }}
                  />
                </Box>
                <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {order.event?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.event?.date
                      ? dayjs(order.event.date).format('MMMM D, YYYY h:mm A')
                      : 'Date not available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.event?.description || 'No description available'}{' '}
                    {/* Add location/venue in the future */}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Attendees
            </Typography>
            {order.attendees && order.attendees.length > 0 ? (
              <Stack spacing={2}>
                {order.attendees.map((attendee, index) => (
                  <Box
                    key={attendee.id}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: (theme) => theme.palette.background.neutral,
                      ...(index < order.attendees.length - 1 && { mb: 1 }),
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6} md={4}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            Attendee
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {`${attendee.firstName} ${attendee.lastName}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {attendee.email}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            Ticket
                          </Typography>
                          <Typography variant="subtitle2">
                            {attendee?.ticket?.ticketType?.title || 'N/A'}
                          </Typography>
                          {/* <Chip
                            size="small"
                            label={attendee.status ? attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1) : 'Unknown'}
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.7rem',
                              width: 'fit-content',
                              backgroundColor: attendee.status === 'checkedIn' ? '#E9FCD4' : '#FFF7CD',
                              color: attendee.status === 'checkedIn' ? '#229A16' : '#B78103',
                            }}
                          /> */}
                        </Stack>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            Price
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                            {formatCurrency(
                              attendee.ticket?.price || attendee.ticket?.ticketType?.price || 0
                            )}
                          </Typography>
                          {attendee.ticket?.ticketAddOn?.addOn && (
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{ display: 'block', fontWeight: 500 }}
                              >
                                Add-on: {attendee.ticket.ticketAddOn.addOn.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                +{formatCurrency(attendee.ticket.ticketAddOn.price || 0)}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  bgcolor: (theme) => theme.palette.background.neutral,
                  borderRadius: 1.5,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No attendees found for this order
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">
                  {formatCurrency((order.totalAmount || 0) + (order.discountAmount || 0))}
                </Typography>
              </Box>

              {(order.discountCode && order.discountAmount) ||
                (order.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">
                      Discount {/* ({order.discountCode?.code || 'N/A'}) */}
                    </Typography>
                    <Typography variant="body1" color="error.main">
                      -{formatCurrency(order.discountAmount || 0)}
                    </Typography>
                  </Box>
                ))}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">SST</Typography>
                <Typography variant="body1">
                  {order.totalAmount > 0 ? formatCurrency(order.tax || 0) : formatCurrency(0)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main" fontWeight={700}>
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
              <Typography variant="h6">Payment Status</Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="eva:edit-fill" />}
                onClick={handleOpenStatusChange}
              >
                Change Status
              </Button>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: getStatusConfig(order.status).bgColor,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Iconify
                icon={getStatusConfig(order.status).icon}
                width={24}
                height={24}
                sx={{ color: getStatusConfig(order.status).color }}
              />
              <Stack spacing={0.5}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: getStatusConfig(order.status).color, fontWeight: 600 }}
                >
                  {order.status
                    ? `${order.status.charAt(0).toUpperCase()}${order.status.slice(1).toLowerCase()}`
                    : 'Unknown'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: getStatusConfig(order.status).color, opacity: 0.8 }}
                >
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
              </Stack>
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Actions
            </Typography>
            <Stack spacing={2}>
              <Button fullWidth variant="outlined" startIcon={<Iconify icon="eva:printer-fill" />}>
                Print Order Details
              </Button>

              {order.status &&
              (order.status.toLowerCase() === 'pending' ||
                order.status.toLowerCase() === 'failed' ||
                order.status.toLowerCase() === 'cancelled') ? (
                <Tooltip title="Resend only available for Paid orders">
                  <span style={{ width: '100%', cursor: 'not-allowed' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="info"
                      startIcon={<Iconify icon="eva:email-fill" />}
                      disabled
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
                  startIcon={<Iconify icon="eva:email-fill" />}
                  onClick={handleOpenResendDialog}
                  disabled={resendingEmail}
                >
                  {resendingEmail ? 'Sending...' : 'Resend Confirmation Email'}
                </Button>
              )}
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
          <Iconify icon="eva:email-fill" width={28} height={28} sx={{ color: 'info.main' }} />
          <Typography variant="h6">Resend Confirmation Email</Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          {order && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to resend the confirmation email for order{' '}
                <b>#{order.orderNumber}</b>?
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Emails will be sent to the following addresses:
              </Typography>

              <List
                sx={{
                  bgcolor: (theme) => theme.palette.background.neutral,
                  borderRadius: 1,
                  mb: 2,
                  py: 0,
                }}
                dense
              >
                <ListItem>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {order.buyerEmail}{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({order.buyerName})
                    </Typography>
                  </Typography>
                </ListItem>

                {order.attendees &&
                  order.attendees.length > 0 &&
                  order.attendees.map((attendee) => (
                    <ListItem key={attendee.id}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        {attendee.email}{' '}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({attendee.firstName} {attendee.lastName})
                        </Typography>
                      </Typography>
                    </ListItem>
                  ))}
              </List>

              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                Note: This action will send emails to all the addresses listed above.
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
            onClick={handleCloseResendDialog}
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
            onClick={handleResendConfirmationEmail}
            disabled={resendingEmail}
            variant="contained"
            color="info"
            startIcon={
              resendingEmail ? (
                <CircularProgress size={20} thickness={4} />
              ) : (
                <Iconify icon="eva:email-fill" />
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
            {resendingEmail ? 'Sending...' : 'Resend Email'}
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
    </Container>
  );
};

OrderDetails.propTypes = {
  orderId: PropTypes.string.isRequired,
};

export default OrderDetails;
