// Order
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import React, { useMemo, useState, useEffect } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  List,
  Grid,
  Card,
  Alert,
  Stack,
  Button,
  Dialog,
  Select,
  Tooltip,
  ListItem,
  Snackbar,
  MenuItem,
  Container,
  TextField,
  IconButton,
  Typography,
  CardContent,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  CircularProgress,
  // Avatar,
  // ButtonGroup,
  // Divider,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useOrderSearchStore } from 'src/hooks/zustand/useOrderSearch';

import { exportToCSV } from 'src/utils/exportcsv';
import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

import { useGetAllEvents } from 'src/api/event';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { TablePaginationCustom } from 'src/components/table';

import OrdersChart from './orders-chart';
import RevenueChart from './revenue-chart';
import AttendeePopover from './attendee-popover';
import SearchMatchIndicator from './search-indicator';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import Label from 'src/components/label';

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

const formatDiscountText = (discountCode) => {
  if (!discountCode) return '';

  if (discountCode.type === 'percentage') {
    return `${discountCode.value}% off`;
  }

  if (discountCode.type === 'fixedAmountPerOrder') {
    return `RM${discountCode.value} off order`;
  }

  return `RM${discountCode.value} off per ticket`;
};

export default function OrderView() {
  const theme = useTheme();

  // Minimalistic palette - theme aware
  const textColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const iconColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const hoverBg = theme.palette.mode === 'light' ? '#f3f3f3' : '#2c2c2c';
  const borderColor = theme.palette.mode === 'light' ? '#eee' : '#333';
  const cardBgColor = theme.palette.mode === 'light' ? '#fff' : '#1e1e1e';

  // Zustand store
  const {
    searchQuery,
    statusFilter,
    priceSort,
    dateRange,
    page,
    rowsPerPage,
    selectedEventId,
    setSearchQuery,
    setStatusFilter,
    setPriceSort,
    setDateRange,
    setPage,
    setRowsPerPage,
    setSelectedEventId,
    togglePriceSort,
    searchOrders,
  } = useOrderSearchStore();

  // Local state for non-persistent UI states
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventOrders, setEventOrders] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const router = useRouter();
  const { eventId } = useParams();

  const { data, isLoading } = useSWR(endpoints.order.root, fetcher);
  const { data: eventData, isLoading: loadingEvents } = useGetAllEvents();

  // For exporting into CSV
  const handleExportCSV = () => {
    if (!eventOrders.length) return;

    const flattened = eventOrders.map((order) => ({
      OrderNumber: order.orderNumber,
      BuyerName: order.buyerName,
      BuyerEmail: order.buyerEmail,
      BuyerPhone: order.buyerPhoneNumber,
      EventName: order.event?.name || '',
      Status: order.status,
      DiscountCode: order.discountCode?.code || '',
      DiscountType: order.discountCode?.type || '',
      DiscountAmount: order.discountAmount,
      TotalAmount: order.totalAmount,
      OrderDate: dayjs(order.createdAt).format('DD-MM-YYYY'),
      AttendeeCount: order.attendees?.length || 0,
    }));

    // Export to CSV (associated event)
    const sanitizedEventName = selectedEvent.name.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${sanitizedEventName}_orders.csv`;

    exportToCSV(flattened, filename);
  };

  // Check for event filter from URL parameter or stored state when component mounts
  useEffect(() => {
    if (eventId && eventData?.events) {
      const foundEvent = eventData.events.find((event) => event.id === eventId);
      if (foundEvent) {
        setSelectedEvent(foundEvent);
        setSelectedEventId(eventId);
        return;
      }
    }

    // If there's a stored selected event ID, try to find and set it
    if (selectedEventId && eventData?.events) {
      const foundEvent = eventData.events.find((event) => event.id === selectedEventId);
      if (foundEvent) {
        setSelectedEvent(foundEvent);
      }
    }
  }, [data, eventId, eventData, selectedEventId, setSelectedEventId]);

  const eventOptions = useMemo(() => {
    if (!data?.length) return ['All'];

    const uniqueEvents = [...new Set(data.map((order) => order.event.name))];
    return ['All', ...uniqueEvents];
  }, [data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
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

  // Update eventOrders when selectedEvent or data changes
  useEffect(() => {
    if (selectedEvent && data?.length) {
      const filtered = data.filter((order) => order.event?.id === selectedEvent.id);
      setEventOrders(filtered);
    } else {
      setEventOrders([]);
    }
  }, [selectedEvent, data]);

  // Sort eventOrders by price if priceSort is set
  const sortedEventOrders = useMemo(() => {
    if (!priceSort) return eventOrders;
    const sorted = [...eventOrders];
    sorted.sort((a, b) => {
      const aPrice = Number(a.totalAmount) || 0;
      const bPrice = Number(b.totalAmount) || 0;
      if (priceSort === 'asc') return aPrice - bPrice;
      return bPrice - aPrice;
    });
    return sorted;
  }, [eventOrders, priceSort]);

  // Get filtered orders (search + status filter)
  const filteredOrders = useMemo(() => {
    const searchFiltered = searchOrders(sortedEventOrders, searchQuery);
    return searchFiltered.filter((order) => {
      let matchesStatus = true;
      if (statusFilter === 'Paid')
        matchesStatus =
          (order.status || '').toLowerCase() === 'paid' && Number(order.totalAmount) > 0;
      else if (statusFilter === 'Pending')
        matchesStatus = (order.status || '').toLowerCase() === 'pending';
      else if (statusFilter === 'Cancelled')
        matchesStatus = (order.status || '').toLowerCase() === 'cancelled';
      else if (statusFilter === 'Free')
        matchesStatus =
          (order.status || '').toLowerCase() === 'paid' && Number(order.totalAmount) === 0;
      return matchesStatus;
    });
  }, [sortedEventOrders, searchQuery, statusFilter, searchOrders]);

  const handlePriceSortToggle = () => {
    togglePriceSort();
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

  if (!selectedEvent) {
    const filteredEvents = (eventData?.events || []).filter((event) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return event.name.toLowerCase().includes(query);
    });

    return (
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1, color: textColor, fontWeight: 700, fontSize: 22 }}>
            Select an Event
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}
          >
            Choose an event to view and manage its orders
          </Typography>
        </Box>

        {/* Search and Filter */}
        <Box sx={{ mb: 0.5 }}>
          <TextField
            fullWidth
            placeholder="Search events by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Iconify
                  icon="eva:search-fill"
                  sx={{
                    color: theme.palette.mode === 'light' ? '#888' : '#aaa',
                    width: 20,
                    height: 20,
                    mr: 1,
                  }}
                />
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                height: 44,
                backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e',
                '& fieldset': {
                  borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                },
              },
            }}
          />
        </Box>

        {/* Status Legend */}
        {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, px: 0.5 }}>
          {[
            { status: 'Active', color: '#4caf50' },
            { status: 'Upcoming', color: '#0288d1' },
            { status: 'Past', color: '#616161' },
          ].map((item) => (
            <Box key={item.status} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  mr: 0.75,
                }}
              />
              <Typography variant="caption" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: 12 }}>
                {item.status}
              </Typography>
            </Box>
          ))}
        </Box> */}

        {/* Events Grid */}
        <Grid container spacing={2}>
          {filteredEvents.map((event) => {
            const test =
              data?.order.filter(
                (a) => a?.event?.id === event?.id && a?.status === 'paid' && a.totalAmount !== 0
              ) || [];
            const attendees = test?.flatMap((a) => a.attendees);

            const discount = test.reduce((acc, curr) => acc + (curr.discountAmount ?? 0), 0);

            const totalTicketPrice = attendees.reduce(
              (acc, cur) => acc + (cur.ticket.price ?? 0) + (cur.ticket.ticketAddOn?.price ?? 0),
              0
            );

            const totalRevenue = totalTicketPrice - discount;

            return (
              <Grid item xs={12} key={event.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    border: `1px solid ${borderColor}`,
                    boxShadow: 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.customShadows.z8,
                      borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                    },
                  }}
                  onClick={() => router.push(paths.dashboard.order.event(event.id))}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Event Logo */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          flexShrink: 0,
                          bgcolor: event.eventSetting?.bgColor || 'background.neutral',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          src={event.eventSetting?.eventLogo || '/logo/nexea.png'}
                          alt={event.name}
                          sx={{
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>

                      {/* Event Details */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ color: textColor, fontWeight: 600, fontSize: 16 }}
                          >
                            {event.name}
                          </Typography>
                          {(() => {
                            const now = dayjs();
                            const startDate = event.date ? dayjs(event.date) : null;
                            let endDate = null;
                            if (event.endDate) {
                              endDate = dayjs(event.endDate);
                            } else if (startDate) {
                              endDate = startDate.add(1, 'day');
                            }

                            let status = 'unknown';
                            let statusColor = '#999';
                            let statusBg = theme.palette.mode === 'light' ? '#f5f5f5' : '#333';

                            if (startDate && endDate) {
                              if (now.isBefore(startDate)) {
                                status = 'Upcoming';
                                statusColor = '#0288d1';
                                statusBg = alpha('#0288d1', 0.1);
                              } else if (now.isAfter(endDate)) {
                                status = 'Past';
                                statusColor = '#616161';
                                statusBg = alpha('#616161', 0.1);
                              } else {
                                status = 'Active';
                                statusColor = '#4caf50';
                                statusBg = alpha('#4caf50', 0.1);
                              }
                            }

                            return (
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: statusColor,
                                  bgcolor: statusBg,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: statusColor,
                                  }}
                                />
                                {status}
                              </Box>
                            );
                          })()}
                        </Box>

                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 1 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Iconify
                              icon="eva:calendar-outline"
                              width={14}
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                mr: 0.5,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                fontSize: '0.75rem',
                              }}
                            >
                              {dayjs(event.date).format('MMM D, YYYY')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Iconify
                              icon="eva:clock-outline"
                              width={14}
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                mr: 0.5,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                fontSize: '0.75rem',
                              }}
                            >
                              {dayjs(event.date).format('h:mm A')}
                            </Typography>
                          </Box>
                          {event.personInCharge && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Iconify
                                icon="eva:person-outline"
                                width={14}
                                sx={{
                                  color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                  mr: 0.5,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {event.personInCharge.fullName}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Stats */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 3,
                            pt: 1.5,
                            mt: 1.5,
                            borderTop: `1px solid ${borderColor}`,
                            width: {
                              xs: '100%',
                              sm: '100%',
                              md: '65%',
                              lg: '70%',
                              xl: '76%',
                            },
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                display: 'block',
                                mb: 0.25,
                              }}
                            >
                              Total Orders
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: textColor, fontWeight: 600 }}
                              >
                                {data?.filter((order) => order.event?.id === event.id).length || 0}
                              </Typography>
                              {(() => {
                                const allOrders =
                                  data?.filter((order) => order.event?.id === event.id) || [];
                                const last7Days = allOrders.filter((order) =>
                                  dayjs(order.createdAt).isAfter(dayjs().subtract(7, 'days'))
                                );
                                const prev7Days = allOrders.filter(
                                  (order) =>
                                    dayjs(order.createdAt).isAfter(dayjs().subtract(14, 'days')) &&
                                    dayjs(order.createdAt).isBefore(dayjs().subtract(7, 'days'))
                                );

                                if (last7Days.length > 0 || prev7Days.length > 0) {
                                  const trend = last7Days.length - prev7Days.length;
                                  let trendColor = '#9e9e9e';
                                  let trendIcon = 'eva:minus-fill';
                                  let trendText = 'same';

                                  if (trend > 0) {
                                    trendColor = '#4caf50';
                                    trendIcon = 'eva:trending-up-fill';
                                    trendText = 'more';
                                  } else if (trend < 0) {
                                    trendColor = '#f44336';
                                    trendIcon = 'eva:trending-down-fill';
                                    trendText = 'fewer';
                                  }

                                  return (
                                    <Tooltip
                                      title={`${Math.abs(trend)} ${trendText} orders compared to previous 7 days`}
                                    >
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <Iconify
                                          icon={trendIcon}
                                          width={16}
                                          sx={{ color: trendColor }}
                                        />
                                      </Box>
                                    </Tooltip>
                                  );
                                }
                                return null;
                              })()}
                            </Box>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                display: 'block',
                                mb: 0.25,
                              }}
                            >
                              Revenue
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: textColor, fontWeight: 600 }}
                            >
                              {new Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: 'MYR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(totalRevenue || 0)}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                display: 'block',
                                mb: 0.25,
                              }}
                            >
                              Attendees
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: textColor, fontWeight: 600 }}
                            >
                              {data
                                ?.filter((order) => order.event?.id === event.id)
                                .reduce((sum, order) => sum + (order.attendees?.length || 0), 0) ||
                                0}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Mini Charts - Desktop Only */}
                        <Box
                          sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            gap: 2,
                            ml: 'auto',
                            pl: 3,
                            borderLeft: `1px solid ${borderColor}`,
                            height: 'calc(100% - 16px)',
                            position: 'absolute',
                            right: 48,
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                        >
                          {/* Orders Chart */}
                          <Box
                            sx={{
                              width: 120,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                  fontSize: '0.6875rem',
                                }}
                              >
                                Orders (7d)
                              </Typography>
                            </Box>
                            <ReactApexChart
                              type="area"
                              series={[
                                {
                                  name: 'Orders',
                                  data: (() => {
                                    const now = dayjs();
                                    const days = Array.from({ length: 7 }, (_, i) =>
                                      now.subtract(i, 'day')
                                    );
                                    const ordersByDay = days
                                      .map(
                                        (day) =>
                                          data?.filter(
                                            (order) =>
                                              order.event?.id === event.id &&
                                              dayjs(order.createdAt).format('YYYY-MM-DD') ===
                                                day.format('YYYY-MM-DD')
                                          ).length || 0
                                      )
                                      .reverse();
                                    return ordersByDay;
                                  })(),
                                },
                              ]}
                              options={{
                                chart: {
                                  sparkline: { enabled: true },
                                  toolbar: { show: false },
                                  zoom: { enabled: false },
                                  animations: {
                                    enabled: true,
                                    easing: 'easeinout',
                                    speed: 800,
                                  },
                                },
                                stroke: { width: 2, curve: 'smooth', lineCap: 'round' },
                                colors: [theme.palette.info.main],
                                fill: {
                                  type: 'gradient',
                                  gradient: {
                                    shadeIntensity: 1,
                                    opacityFrom: 0.45,
                                    opacityTo: 0.05,
                                    stops: [50, 100],
                                  },
                                },
                                tooltip: {
                                  enabled: true,
                                  custom({ series, seriesIndex, dataPointIndex }) {
                                    const date = dayjs().subtract(6 - dataPointIndex, 'days');
                                    const dailyOrderCount = series[seriesIndex][dataPointIndex];
                                    const paidOrders =
                                      data?.filter(
                                        (order) =>
                                          order.event?.id === event.id &&
                                          dayjs(order.createdAt).format('YYYY-MM-DD') ===
                                            date.format('YYYY-MM-DD') &&
                                          order.status === 'paid'
                                      ).length || 0;

                                    return `
                                    <div style="padding: 8px;">
                                      <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                                        ${date.format('MMM D, YYYY')}
                                      </div>
                                      <div style="font-size: 13px; color:#666; margin-bottom: 4px;">
                                        <b>Total Orders:</b> ${dailyOrderCount}
                                      </div>
                                      <div style="font-size: 11px; color: #4caf50;">
                                        Paid: ${paidOrders}
                                      </div>

                                    </div>
                                  `;
                                  },
                                },
                                grid: { padding: { top: -10, bottom: -10 } },
                              }}
                              height={35}
                            />
                          </Box>

                          {/* Revenue Chart */}
                          <Box
                            sx={{
                              width: 120,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                                  fontSize: '0.6875rem',
                                }}
                              >
                                Revenue (7d)
                              </Typography>
                            </Box>
                            <ReactApexChart
                              type="area"
                              series={[
                                {
                                  name: 'Revenue',
                                  data: (() => {
                                    const now = dayjs();
                                    const days = Array.from({ length: 7 }, (_, i) =>
                                      now.subtract(i, 'day')
                                    );
                                    const revenueByDay = days
                                      .map(
                                        (day) =>
                                          data
                                            ?.filter(
                                              (order) =>
                                                order.event?.id === event.id &&
                                                order.status === 'paid' &&
                                                dayjs(order.createdAt).format('YYYY-MM-DD') ===
                                                  day.format('YYYY-MM-DD')
                                            )
                                            .reduce(
                                              (sum, order) => sum + (order.totalAmount || 0),
                                              0
                                            ) || 0
                                      )
                                      .reverse();
                                    return revenueByDay;
                                  })(),
                                },
                              ]}
                              options={{
                                chart: {
                                  sparkline: { enabled: true },
                                  toolbar: { show: false },
                                  zoom: { enabled: false },
                                  animations: {
                                    enabled: true,
                                    easing: 'easeinout',
                                    speed: 800,
                                  },
                                },
                                stroke: { width: 2, curve: 'smooth', lineCap: 'round' },
                                colors: [theme.palette.primary.main],
                                fill: {
                                  type: 'gradient',
                                  gradient: {
                                    shadeIntensity: 1,
                                    opacityFrom: 0.45,
                                    opacityTo: 0.05,
                                    stops: [50, 100],
                                  },
                                },
                                tooltip: {
                                  enabled: true,
                                  custom({ series, seriesIndex, dataPointIndex }) {
                                    const date = dayjs().subtract(6 - dataPointIndex, 'days');
                                    const revenue = series[seriesIndex][dataPointIndex];
                                    const dailyPaidOrders = data?.filter(
                                      (order) =>
                                        order.event?.id === event.id &&
                                        order.status === 'paid' &&
                                        dayjs(order.createdAt).format('YYYY-MM-DD') ===
                                          date.format('YYYY-MM-DD')
                                    );
                                    const orderCount = dailyPaidOrders?.length || 0;

                                    return `
                                    <div style="padding: 8px;">
                                      <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                                        ${date.format('MMM D, YYYY')}
                                      </div>
                                      <div style="font-size: 13px; color:#666; margin-bottom: 4px;">
                                        <b>Revenue:</b> RM ${revenue.toFixed(2)}
                                      </div>
                                      <div style="font-size: 11px; color: #666;">
                                        Orders: ${orderCount}
                                      </div>
                                    </div>
                                  `;
                                  },
                                },
                                grid: { padding: { top: -10, bottom: -10 } },
                              }}
                              height={35}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* Arrow Icon */}
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        <Iconify
                          icon="eva:arrow-ios-forward-fill"
                          width={20}
                          sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Empty State */}
        {(!eventData?.events || filteredEvents.length === 0) && (
          <EmptyContent
            title={searchQuery ? 'No Matching Events' : 'No Events Found'}
            description={
              searchQuery
                ? 'Try adjusting your search terms'
                : 'There are no events available at the moment.'
            }
            imgUrl="/assets/illustrations/illustration_empty_content.svg"
            sx={{ py: 10 }}
          />
        )}
      </Container>
    );
  }

  // Orders Table for Selected Event
  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton
          onClick={() => {
            setSelectedEvent(null);
            setSelectedEventId(null);
            router.push('/dashboard/order');
          }}
          sx={{ color: iconColor, mr: 1, p: 0.5 }}
        >
          <Iconify icon="eva:arrow-back-fill" width={20} />
        </IconButton>
        <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, fontSize: 18 }}>
          {selectedEvent.name}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              displayEmpty
              sx={{
                height: 32,
                fontSize: 13,
                '& .MuiSelect-select': {
                  py: 0.5,
                  px: 1.5,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                },
              }}
            >
              <MenuItem value="thisWeek" sx={{ fontSize: 13 }}>
                This week
              </MenuItem>
              <MenuItem value={7} sx={{ fontSize: 13 }}>
                Last 7 days
              </MenuItem>
              <MenuItem value={14} sx={{ fontSize: 13 }}>
                Last 14 days
              </MenuItem>
              <MenuItem value={30} sx={{ fontSize: 13 }}>
                Last 30 days
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {/* Statistics and Revenue/Order Graphs */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <RevenueChart
          eventOrders={eventOrders}
          selectedEvent={selectedEvent}
          dateRange={dateRange}
        />
        <OrdersChart
          eventOrders={eventOrders}
          selectedEvent={selectedEvent}
          dateRange={dateRange}
        />
      </Stack>
      {/* Search and Status Filter */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-start',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 2,
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Tooltip
            title="Search orders by ID, buyer info, attendee details, or discount codes"
            placement="top"
            arrow
          >
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search..."
              InputProps={{
                startAdornment: (
                  <Iconify
                    icon="eva:search-fill"
                    sx={{
                      color: theme.palette.mode === 'light' ? '#888' : '#aaa',
                      width: 18,
                      height: 18,
                      mr: 1,
                    }}
                  />
                ),
                endAdornment: searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{
                      color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                      p: 0.5,
                      mr: 0.5,
                    }}
                  >
                    <Iconify icon="eva:close-fill" width={16} height={16} />
                  </IconButton>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: searchFocused ? 320 : 180 },
                maxWidth: '100%',
                transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s',
                '& .MuiOutlinedInput-root': {
                  height: 36,
                  fontSize: 14,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#333',
                  borderColor,
                  '& fieldset': {
                    borderColor,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'light' ? '#999' : '#777',
                  },
                },
              }}
            />
          </Tooltip>
          {searchQuery && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: '100%',
                left: 8,
                mt: 1,
                mb: 2,
                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                fontSize: '0.7rem',
                fontWeight: 500,
                zIndex: 1,
              }}
            >
              {filteredOrders.length > 0
                ? `${filteredOrders.length} result${filteredOrders.length !== 1 ? 's' : ''} found`
                : 'No results found'}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-start' },
            gap: 1,
            width: '100%',
            mt: searchQuery ? 2 : 0,
            mb: searchQuery ? 2 : 0,
          }}
        >
          {['All', 'Paid', 'Pending', 'Cancelled', 'Free'].map((status) => {
            // Calculate count for each status using search-filtered results
            const searchFiltered = searchOrders(eventOrders, searchQuery);
            let count = searchFiltered.length; // Default for 'All'
            if (status === 'Paid') {
              count = searchFiltered.filter(
                (order) => order.status === 'paid' && Number(order.totalAmount) > 0
              ).length;
            } else if (status === 'Pending') {
              count = searchFiltered.filter((order) => order.status === 'pending').length;
            } else if (status === 'Cancelled') {
              count = searchFiltered.filter((order) => order.status === 'cancelled').length;
            } else if (status === 'Free') {
              count = searchFiltered.filter(
                (order) => order.status === 'paid' && Number(order.totalAmount) === 0
              ).length;
            }

            return (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: (() => {
                    if (statusFilter === status) {
                      return theme.palette.mode === 'light' ? '#fff' : '#000';
                    }
                    return textColor;
                  })(),
                  bgcolor: (() => {
                    if (statusFilter === status) {
                      return theme.palette.mode === 'light' ? '#111' : '#eee';
                    }
                    return 'transparent';
                  })(),
                  border: `1px solid ${borderColor}`,
                  borderRadius: 1,
                  minWidth: 'auto',
                  px: 1.5,
                  height: 32,
                  '&:hover': {
                    bgcolor: (() => {
                      if (statusFilter === status) {
                        return theme.palette.mode === 'light' ? '#222' : '#ddd';
                      }
                      return theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d';
                    })(),
                    borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                  },
                  '&:active': {
                    bgcolor: (() => {
                      if (statusFilter === status) {
                        return theme.palette.mode === 'light' ? '#000' : '#fff';
                      }
                      return theme.palette.mode === 'light' ? '#e0e0e0' : '#404040';
                    })(),
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {status} ({count})
              </Button>
            );
          })}
        </Box>

        {/* Download CSV Button */}
        <Tooltip title="Export as CSV">
          <Button
            variant="outlined"
            size="small"
            onClick={handleExportCSV}
            startIcon={
              <Iconify
                icon="eva:download-outline"
                width={18}
                height={18}
                sx={{ color: textColor }}
              />
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: textColor,
              bgcolor: theme.palette.mode === 'light' ? '#f3f3f3' : '#333',
              borderColor: 'transparent',
              borderRadius: 1,
              px: 2,
              mt: { xs: 1, sm: 0 },
              '&:hover': {
                bgcolor: theme.palette.mode === 'light' ? '#e0e0e0' : '#444',
                borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
              },
              '&:active': {
                bgcolor: theme.palette.mode === 'light' ? '#d0d0d0' : '#505050',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Export
          </Button>
        </Tooltip>
      </Box>
      {/* Orders Table */}
      <Box
        sx={{
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          bgcolor: cardBgColor,
          overflow: 'hidden',
        }}
      >
        {/* Header row for desktop */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 2,
            py: 1,
            bgcolor: hoverBg,
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>
            Order ID
          </Typography>
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>
            Buyer Name
          </Typography>
          <Typography sx={{ width: '10%', color: textColor, fontWeight: 600, fontSize: 13 }}>
            Phone
          </Typography>
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>
            Discount Code
          </Typography>
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>
            Order Date
          </Typography>
          <Box
            sx={{
              width: '12%',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={handlePriceSortToggle}
          >
            <Typography sx={{ color: textColor, fontWeight: 600, fontSize: 13, mr: 0.5 }}>
              Price (RM)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.2 }}>
              <ArrowDropUpIcon
                fontSize="small"
                sx={{ color: priceSort === 'asc' ? '#111' : '#bbb', mb: '-6px' }}
              />
              <ArrowDropDownIcon
                fontSize="small"
                sx={{ color: priceSort === 'desc' ? '#111' : '#bbb', mt: '-6px' }}
              />
            </Box>
          </Box>
          <Typography sx={{ width: '12%', color: textColor, fontWeight: 600, fontSize: 13 }}>
            Order Status
          </Typography>
          <Typography sx={{ width: '6%', color: textColor, fontWeight: 600, fontSize: 13 }}>
            Actions
          </Typography>
        </Stack>
        <Stack>
          {filteredOrders
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((order) => {
              let statusConfig = { color: textColor, icon: 'eva:clock-fill' };
              if (order.status === 'paid')
                statusConfig = { color: '#229A16', icon: 'eva:checkmark-circle-2-fill' };
              else if (order.status === 'pending')
                statusConfig = { color: '#B78103', icon: 'eva:clock-fill' };
              else if (order.status === 'failed')
                statusConfig = { color: '#B72136', icon: 'ic:outline-block' };
              return (
                <Stack
                  key={order.id}
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  sx={{
                    p: 2,
                    borderBottom: `1px solid ${borderColor}`,
                    position: 'relative',
                    '&:hover': {
                      bgcolor: hoverBg,
                      '& .action-buttons': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {/* Clickable overlay */}
                  {/* <Box
                    onClick={() => router.push(paths.dashboard.order.details(order.id))}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      cursor: 'pointer',
                      zIndex: 1,
                    }}
                  /> */}

                  {/* Mobile layout - Card style */}
                  <Box
                    sx={{
                      display: { xs: 'flex', md: 'none' },
                      flexDirection: 'column',
                      width: '100%',
                      mb: 1,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            color: textColor,
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {order.orderNumber}
                        </Typography>
                        <SearchMatchIndicator
                          searchContext={order.searchContext}
                          searchQuery={searchQuery}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon={statusConfig.icon}
                          sx={{ width: 14, height: 14, color: statusConfig.color }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: statusConfig.color, fontWeight: 600, fontSize: 13 }}
                        >
                          {order.status
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                            : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                        Buyer:
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          sx={{ color: textColor, fontSize: 13, fontWeight: 500, mb: 0.25 }}
                        >
                          {order.buyerName}
                        </Typography>
                        <Typography
                          sx={{ color: theme.palette.text.secondary, fontSize: 11, mb: 0.25 }}
                        >
                          {order.buyerEmail}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 11 }}>
                          {order.buyerPhoneNumber || 'No Phone'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                        Price:
                      </Typography>
                      <Typography sx={{ color: textColor, fontSize: 13, fontWeight: 500 }}>
                        RM {order.totalAmount?.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                        Date:
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ color: textColor, fontSize: 13, mb: 0.25 }}>
                          {dayjs(order.createdAt).format('LL')}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 11 }}>
                          {dayjs(order.createdAt).format('h:mm A')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                        Discount:
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ color: textColor, fontSize: 13, mb: 0.25 }}>
                          {order?.discountCode?.code || 'N/A'}
                        </Typography>
                        {order?.discountCode?.code && (
                          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 11 }}>
                            {formatDiscountText(order.discountCode)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 0.5,
                      }}
                    >
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                        Attendees:
                      </Typography>
                      <AttendeePopover attendees={order.attendees} searchQuery={searchQuery} />
                    </Box>
                    <Stack
                      direction="row"
                      className="action-buttons"
                      sx={{
                        mt: 1,
                        position: 'relative',
                        zIndex: 2,
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
                        borderRadius: 1,
                        overflow: 'hidden',
                        alignSelf: 'flex-end',
                        height: 32,
                      }}
                    >
                      <Tooltip title="View Order Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(paths.dashboard.order.details(order.id));
                          }}
                          sx={{
                            color: iconColor,
                            p: 0.5,
                            borderRadius: 0,
                            height: 30,
                            width: 30,
                          }}
                        >
                          <Iconify icon="eva:info-outline" width={16} height={16} />
                        </IconButton>
                      </Tooltip>
                      <Box
                        sx={{
                          width: '1px',
                          bgcolor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
                        }}
                      />
                      <Tooltip
                        title={
                          order.status !== 'paid'
                            ? 'Resend only for Paid orders'
                            : 'Resend Confirmation Email'
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenResendDialog(order);
                          }}
                          sx={{
                            color: iconColor,
                            p: 0.5,
                            borderRadius: 0,
                            height: 30,
                            width: 30,
                          }}
                          disabled={order.status !== 'paid'}
                        >
                          <Iconify icon="eva:email-outline" width={16} height={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Desktop layout - row style */}
                  <Box
                    sx={{
                      width: '15%',
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: textColor,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {order.orderNumber}
                    </Typography>
                    <SearchMatchIndicator
                      searchContext={order.searchContext}
                      searchQuery={searchQuery}
                    />
                  </Box>
                  <Box sx={{ width: '15%', display: { xs: 'none', md: 'block' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box>
                        <Typography sx={{ color: textColor, fontSize: 13 }}>
                          {order.buyerName}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                          {order.buyerEmail}
                        </Typography>
                      </Box>
                      <AttendeePopover attendees={order.attendees} searchQuery={searchQuery} />
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      width: '10%',
                      color: textColor,
                      fontSize: 13,
                      display: { xs: 'none', md: 'block' },
                    }}
                  >
                    {order.buyerPhoneNumber || 'No Phone'}
                  </Typography>
                  <Box sx={{ width: '15%', display: { xs: 'none', md: 'block' } }}>
                    <Typography sx={{ color: textColor, fontSize: 13 }}>
                      {order?.discountCode?.code || 'N/A'}
                    </Typography>
                    {order?.discountCode?.code && (
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                        {formatDiscountText(order.discountCode)}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ width: '15%', display: { xs: 'none', md: 'block' } }}>
                    <Typography sx={{ color: textColor, fontSize: 13 }}>
                      {dayjs(order.createdAt).format('LL')}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                      {dayjs(order.createdAt).format('h:mm A')}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      width: '12%',
                      color: textColor,
                      fontSize: 13,
                      display: { xs: 'none', md: 'block' },
                    }}
                  >
                    RM {order.totalAmount?.toFixed(2)}
                  </Typography>
                  <Box
                    sx={{
                      width: '12%',
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Iconify
                      icon={statusConfig.icon}
                      sx={{ width: 14, height: 14, color: statusConfig.color }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: statusConfig.color, fontWeight: 600, fontSize: 13 }}
                    >
                      {order.status
                        ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                        : ''}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    className="action-buttons"
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      position: 'relative',
                      zIndex: 2,
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
                      borderRadius: 1,
                      overflow: 'hidden',
                      height: 32,
                      ml: 'auto',
                      mr: 1,
                    }}
                  >
                    <Tooltip title="View Order Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(paths.dashboard.order.details(order.id));
                        }}
                        sx={{
                          color: iconColor,
                          p: 0.5,
                          borderRadius: 0,
                          height: 30,
                          width: 30,
                        }}
                      >
                        <Iconify icon="eva:file-text-outline" width={16} height={16} />
                      </IconButton>
                    </Tooltip>
                    <Box
                      sx={{
                        width: '1px',
                        bgcolor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
                      }}
                    />
                    <Tooltip
                      title={
                        order.status !== 'paid'
                          ? 'Resend only for Paid orders'
                          : 'Resend Confirmation Email'
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenResendDialog(order);
                        }}
                        sx={{
                          color: iconColor,
                          p: 0.5,
                          borderRadius: 0,
                          height: 30,
                          width: 30,
                        }}
                        disabled={order.status !== 'paid'}
                      >
                        <Iconify icon="eva:email-outline" width={16} height={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              );
            })}
        </Stack>
        <TablePaginationCustom
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
          }}
        />
      </Box>
      {/* Resend Email Dialog and Snackbar (reuse existing logic) */}
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
            background:
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
            backgroundColor:
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
                  bgcolor: theme.palette.background.neutral,
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
            backgroundColor:
              theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(26, 32, 44, 0.5)',
            borderTop: '1px solid',
            borderColor: theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseResendDialog}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              borderColor: theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568',
              color: theme.palette.mode === 'light' ? '#64748b' : '#a0aec0',
              borderWidth: '1.5px',
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(74, 85, 104, 0.2)',
                borderColor: theme.palette.mode === 'light' ? '#cbd5e1' : '#718096',
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
    </Container>
  );
}
