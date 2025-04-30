// Order
import useSWR from 'swr';
import dayjs from 'dayjs';
import React, { useMemo, useState, useEffect } from 'react';

import { alpha } from '@mui/material/styles';
import {
  Box,
  List,
  Grid,
  Alert,
  Stack,
  Button,
  Select,
  Dialog,
  Avatar,
  Tooltip,
  Divider,
  ListItem,
  MenuItem,
  Snackbar,
  Container,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

// import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { TablePaginationCustom } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

const orders = [
  {
    id: 'ORD123',
    eventName: 'Music Festival',
    attendeeName: 'John Doe',
    discountCode: 'SUMMER10',
    orderDate: '2025-03-06',
    status: 'Confirmed',
  },
  {
    id: 'ORD124',
    eventName: 'Tech Conference',
    attendeeName: 'Jane Smith',
    discountCode: 'TECH20',
    orderDate: '2025-03-05',
    status: 'Pending',
  },
  {
    id: 'ORD125',
    eventName: 'Art Expo',
    attendeeName: 'Alice Brown',
    discountCode: 'ART30',
    orderDate: '2025-03-04',
    status: 'Cancelled',
  },
  {
    id: 'ORD126',
    eventName: 'Food Carnival',
    attendeeName: 'Bob White',
    discountCode: 'FOOD15',
    orderDate: '2025-03-03',
    status: 'Confirmed',
  },
];
const STATUS_TABS = ['All', 'paid', 'pending', 'failed'];

export default function OrderView() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    eventName: '',
    attendeeName: '',
    discountCode: '',
    orderDate: '',
  });
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading } = useSWR(endpoints.order.root, fetcher);
  const router = useRouter();

  // Check for event filter from sessionStorage when component mounts
  useEffect(() => {
    const storedEventFilter = sessionStorage.getItem('orderEventFilter');
    if (storedEventFilter && data?.length) {
      // Check if the stored event name exists in available options
      const eventExists = data.some((order) => order.event.name === storedEventFilter);
      if (eventExists) {
        setEventFilter(storedEventFilter);
      }
      // Remove the stored filter to avoid applying it on subsequent visits
      sessionStorage.removeItem('orderEventFilter');
    }
  }, [data]);

  const eventOptions = useMemo(() => {
    if (!data?.length) return ['All'];

    const uniqueEvents = [...new Set(data.map((order) => order.event.name))];
    return ['All', ...uniqueEvents];
  }, [data]);

  const filteredOrders =
    !!data?.length &&
    data.filter(
      (order) =>
        (tab === 'All' || order.status === tab.toLowerCase()) &&
        (eventFilter === 'All' || order.event.name === eventFilter) &&
        (order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.event.name.toLowerCase().includes(search.toLowerCase()) ||
          order.attendee.name.toLowerCase().includes(search.toLowerCase()) ||
          order.discountCode.code.toLowerCase().includes(search.toLowerCase()) ||
          order.status.toLowerCase().includes(search.toLowerCase()))
    );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
  };

  const handleCreateOrder = () => {
    const orderId = `ORD${Math.floor(100 + Math.random() * 900)}`;
    const status = 'Pending';
    const order = { id: orderId, status, ...newOrder };
    orders.unshift(order);
    setNewOrder({
      eventName: '',
      attendeeName: '',
      discountCode: '',
      orderDate: '',
    });
    setOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenResendDialog = (order) => {
    setSelectedOrder(order);
    setResendDialogOpen(true);
  };

  const handleCloseResendDialog = () => {
    setResendDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleResendConfirmationEmail = async () => {
    if (!selectedOrder) return;
    
    // Check if order status is paid
    if (selectedOrder.status !== 'paid') {
      setSnackbar({
        open: true,
        message: 'Only paid orders can have confirmation emails resent.',
        severity: 'warning',
      });
      handleCloseResendDialog();
      return;
    }

    try {
      setResendingEmail(true);
      const response = await axiosInstance.post(
        endpoints.order.payment.resendConfirmation(selectedOrder.id)
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
      <Box
        sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'left', sm: 'center' },
            mb: { xs: 3, md: 5 },
            gap: 1,
          }}
        >
          <CustomBreadcrumbs
            heading="Order View"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Order View' },
              { name: 'List' },
            ]}
          />
        </Box>

        {/* Search and Actions Section */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  mb: 2,
                  width: '100%',
                }}
              >
                <TextField
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Orders"
                  InputProps={{
                    startAdornment: (
                      <Iconify
                        icon="eva:search-fill"
                        sx={{
                          color: 'text.disabled',
                          width: 20,
                          height: 20,
                          mr: 1,
                        }}
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 40,
                    },
                  }}
                />

                <Select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  sx={{
                    minWidth: 200,
                    height: 40,
                  }}
                >
                  {eventOptions.map((event) => (
                    <MenuItem key={event} value={event}>
                      {event}
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  variant="contained"
                  color="info"
                  onClick={handleClickOpen}
                  sx={{
                    minWidth: 'fit-content',
                    height: 40,
                    fontWeight: 550,
                  }}
                >
                  Create Order
                </Button>
              </Stack>

              {/* Status Filter Buttons - Similar to event-lists.jsx */}
              <Stack
                direction="row"
                sx={{
                  width: 'fit-content',
                  position: 'relative',
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  '& .MuiButton-root': {
                    fontSize: '0.875rem',
                    fontWeight: 450,
                  },
                }}
              >
                {STATUS_TABS.map((status, index) => {
                  const isActive = tab === status;
                  let statusConfig = { color: 'text.primary', bgColor: 'transparent' };

                  if (status === 'paid') {
                    statusConfig = {
                      icon: 'eva:checkmark-circle-2-fill',
                      color: '#229A16',
                      bgColor: '#E9FCD4',
                    };
                  } else if (status === 'pending') {
                    statusConfig = {
                      icon: 'eva:clock-fill',
                      color: '#B78103',
                      bgColor: '#FFF7CD',
                    };
                  } else if (status === 'failed') {
                    statusConfig = {
                      icon: 'ic:outline-block',
                      color: '#B72136',
                      bgColor: '#FFE7D9',
                    };
                  }

                  let buttonColor = 'text.secondary';
                  let buttonBgColor = 'transparent';

                  if (isActive) {
                    if (status === 'All') {
                      buttonColor = 'text.primary';
                      buttonBgColor = (theme) =>
                        theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)';
                    } else {
                      buttonColor = statusConfig.color;
                      buttonBgColor = statusConfig.bgColor;
                    }
                  }

                  let hoverBgColor = 'action.hover';

                  if (isActive) {
                    if (status === 'All') {
                      hoverBgColor = (theme) =>
                        theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)';
                    } else {
                      hoverBgColor = statusConfig.bgColor;
                    }
                  }

                  return (
                    <Button
                      key={status}
                      disableRipple
                      onClick={(e) => setTab(status)}
                      startIcon={
                        status !== 'All' ? (
                          <Iconify icon={statusConfig.icon} sx={{ width: 18, height: 18 }} />
                        ) : null
                      }
                      sx={{
                        minWidth: 'max-content',
                        height: '32px',
                        px: 1.5,
                        color: buttonColor,
                        bgcolor: buttonBgColor,
                        borderRight: index !== STATUS_TABS.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: hoverBgColor,
                        },
                      }}
                    >
                      {status[0].toUpperCase() + status.slice(1)}
                    </Button>
                  );
                })}
              </Stack>
            </Grid>

            {/* Table Section - Separate from search/filter controls */}
            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: { xs: 'auto', sm: 'hidden' },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? '#f1f2f3' : 'background.neutral',
                    minWidth: { xs: 800, sm: '100%' },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      width: '100%',
                      '& > *:not(:last-child)': {
                        borderRight: (theme) =>
                          `1px solid ${theme.palette.mode === 'light' ? '#dedfe2' : 'rgba(255, 255, 255, 0.12)'}`,
                        pr: 2,
                        mr: 2,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Order ID
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '20%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Event Name
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '20%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Buyer Name
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Discount Code
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Order Date
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Price (RM)
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Status
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '5%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Actions
                    </Typography>
                  </Stack>
                </Stack>
                <Stack
                  sx={{
                    maxHeight: '70vh',
                    overflow: 'auto',
                    minWidth: { xs: 800, sm: '100%' },
                  }}
                >
                  {(filteredOrders || [])
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => {
                      let statusConfig = {};

                      if (order.status === 'paid') {
                        statusConfig = {
                          color: '#229A16',
                          bgColor: '#E9FCD4',
                          icon: 'eva:checkmark-circle-2-fill',
                        };
                      } else if (order.status === 'pending') {
                        statusConfig = {
                          color: '#B78103',
                          bgColor: '#FFF7CD',
                          icon: 'eva:clock-fill',
                        };
                      } else {
                        statusConfig = {
                          color: '#B72136',
                          bgColor: '#FFE7D9',
                          icon: 'ic:outline-block',
                        };
                      }

                      return (
                        <Tooltip title="View Order Details" arrow followCursor>
                          <Stack
                            key={order.id}
                            direction="row"
                            alignItems="center"
                            onClick={() => router.push(paths.dashboard.order.details(order.id))}
                            sx={{
                              px: 3,
                              py: 1.5,
                              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                              transition: 'all 0.2s ease-in-out',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'background.neutral',
                              },
                            }}
                            spacing={1}
                          >
                            <Box sx={{ width: '15%' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: 'grey.600',
                                  p: 0.75,
                                  borderRadius: 1,
                                  bgcolor: (theme) => alpha(theme.palette.grey[600], 0.08),
                                  display: 'inline-flex',
                                  fontSize: '0.8125rem',
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.25px',
                                }}
                              >
                                {order.orderNumber}
                              </Typography>
                            </Box>

                            <Typography variant="body2" sx={{ width: '20%' }}>
                              {order.event.name}
                            </Typography>

                            <Typography variant="body2" sx={{ width: '20%' }}>
                              {order.buyerName}
                            </Typography>

                            <Typography variant="body2" sx={{ width: '15%' }}>
                              {order?.discountCode?.code || 'N/A'}
                            </Typography>

                            <Typography variant="body2" sx={{ width: '15%' }}>
                              {dayjs(order.createdAt).format('LL')}
                            </Typography>

                            <Typography variant="body2" sx={{ width: '15%' }}>
                              RM {order.totalAmount.toFixed(2)}
                            </Typography>

                            <Box sx={{ width: '15%' }}>
                              <Box
                                sx={{
                                  py: 0.5,
                                  px: 1,
                                  borderRadius: 1,
                                  width: 'fit-content',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  bgcolor: statusConfig.bgColor,
                                }}
                              >
                                <Iconify
                                  icon={statusConfig.icon}
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    color: statusConfig.color,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: statusConfig.color,
                                    fontWeight: 600,
                                  }}
                                >
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}{' '}
                                  {/* added this because prisma's status is in lowercase, temporary solution */}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ width: '5%', display: 'flex', justifyContent: 'center' }}>
                              <Tooltip title="View Order Details">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(paths.dashboard.order.details(order.id));
                                  }}
                                  sx={{
                                    color: 'primary.main',
                                  }}
                                >
                                  <Iconify icon="eva:info-outline" width={20} height={20} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={order.status !== 'paid' ? "Resend only available for Paid orders" : "Resend Confirmation Email"}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenResendDialog(order);
                                  }}
                                  sx={{
                                    color: 'info.main',
                                  }}
                                  disabled={order.status !== 'paid'}
                                >
                                  <Iconify icon="eva:email-outline" width={20} height={20} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Stack>
                        </Tooltip>
                      );
                    })}
                </Stack>
              </Box>

              {!filteredOrders && (
                <EmptyContent
                  filled
                  title="No Orders"
                  sx={{
                    py: 10,
                  }}
                />
              )}
              {/* <TableNoData notFound={!filteredOrders} sx={{ width: 1 }} /> */}

              <TablePaginationCustom
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog
        open={open}
        onClose={handleClose}
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
                : 'linear-gradient(to bottom, #1a202c, #2d3748)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 3,
            px: 4,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(245, 247, 250, 0.85)'
                : 'rgba(26, 32, 44, 0.85)',
          }}
        >
          <Avatar
            alt="Order"
            src="/logo/nexea.png"
            sx={{
              width: 58,
              height: 58,
              marginRight: 2.5,
              border: (theme) => `3px solid ${theme.palette.background.paper}`,
              backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f0f4f8' : '#2d3748'),
            }}
          />
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                color: (theme) => theme.palette.text.primary,
                letterSpacing: '-0.3px',
                mb: 0.5,
              }}
            >
              Create Order
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.85rem',
              }}
            >
              Create a new order for an event
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            p: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2.5}>
            <TextField
              label="Event Name"
              name="eventName"
              fullWidth
              margin="dense"
              onChange={handleChange}
            />
            <TextField
              label="Attendee Name"
              name="attendeeName"
              fullWidth
              margin="dense"
              onChange={handleChange}
            />
            <TextField
              label="Discount Code"
              name="discountCode"
              fullWidth
              margin="dense"
              onChange={handleChange}
            />
            <TextField
              label="Order Date"
              name="orderDate"
              fullWidth
              margin="dense"
              type="date"
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(26, 32, 44, 0.5)',
            borderTop: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748'),
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: 4,
              height: '46px',
              padding: '0 24px',
              fontWeight: 600,
              borderColor: (theme) => (theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568'),
              color: (theme) => (theme.palette.mode === 'light' ? '#64748b' : '#a0aec0'),
              borderWidth: '1.5px',
              letterSpacing: '0.3px',
              textTransform: 'none',
              fontSize: '0.95rem',
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
            onClick={handleCreateOrder}
            variant="contained"
            sx={{
              borderRadius: 4,
              height: '46px',
              padding: '0 28px',
              fontWeight: 600,
              backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#38bdf8' : '#3182ce'),
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
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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
          {selectedOrder && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to resend the confirmation email for order{' '}
                <b>#{selectedOrder.orderNumber}</b>?
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
                    {selectedOrder.buyerEmail}{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({selectedOrder.buyerName})
                    </Typography>
                  </Typography>
                </ListItem>

                {selectedOrder.attendees &&
                  selectedOrder.attendees.length > 0 &&
                  selectedOrder.attendees.map((attendee) => (
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
    </>
  );
}
