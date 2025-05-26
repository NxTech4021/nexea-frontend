// Order
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import React, { useMemo, useState, useEffect } from 'react';
import { exportToCSV } from 'src/utils/exportcsv';
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
  Tooltip,
  ListItem,
  Snackbar,
  Container,
  TextField,
  IconButton,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  // Avatar,
  // ButtonGroup,
  // Divider,
  // MenuItem,
  // Select,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

import { useGetAllEvents } from 'src/api/event';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { TablePaginationCustom } from 'src/components/table';
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

export default function OrderView() {
  const theme = useTheme();
  
  // Minimalistic palette - theme aware
  const textColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const iconColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const hoverBg = theme.palette.mode === 'light' ? '#f3f3f3' : '#2c2c2c';
  const borderColor = theme.palette.mode === 'light' ? '#eee' : '#333';
  const cardBgColor = theme.palette.mode === 'light' ? '#fff' : '#1e1e1e';
  
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventOrders, setEventOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priceSort, setPriceSort] = useState(null);

  const router = useRouter();
  const { eventId } = useParams();

  const { data, isLoading } = useSWR(endpoints.order.root, fetcher);
  const { data: eventData, isLoading: loadingEvents } = useGetAllEvents();


  // For exporting into CSV 
 const handleExportCSV = () => {
  if (!eventOrders.length) return;

  const flattened = eventOrders.map(order => ({
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

  // Example CSV export logic (adjust based on your actual export library)
  exportToCSV(flattened, 'event_orders.csv');
};


console.log("events", eventOrders

)
  // Check for event filter from sessionStorage or URL parameter when component mounts
  useEffect(() => {
    if (eventId && eventData?.events) {
      const foundEvent = eventData.events.find(event => event.id === eventId);
      if (foundEvent) {
        setSelectedEvent(foundEvent);
        return;
      }
    }
    
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
  }, [data, eventId, eventData]);

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

  // Revenue chart data for selected event
  const revenueChart = useMemo(() => {
    if (!selectedEvent || !eventOrders.length) return { series: [], categories: [] };
    
    // Group by date (YYYY-MM-DD) and only include dates with revenue
    const map = {};
    eventOrders.forEach((order) => {
      if (order.status === 'paid') {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        map[date] = (map[date] || 0) + (order.totalAmount || 0);
      }
    });

    // Sort dates and format for display
    const categories = Object.keys(map).sort();
    const series = categories.map((date) => map[date]);
    const formattedCategories = categories.map(date => dayjs(date).format('MMM D'));

    return { 
      series, 
      categories: formattedCategories,
      rawDates: categories 
    };
  }, [eventOrders, selectedEvent]);

  // Add order count chart data
  const orderCountChart = useMemo(() => {
    if (!selectedEvent || !eventOrders.length) return { series: [], categories: [] };

    // Group by date (YYYY-MM-DD) and only include dates with orders
    const map = {};
    eventOrders.forEach((order) => {
      // Include only paid orders and free orders
      if (order.status === 'paid' || (order.status !== 'cancelled' && Number(order.totalAmount) === 0)) {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        map[date] = (map[date] || 0) + 1;
      }
    });

    // Sort dates and format for display
    const categories = Object.keys(map).sort();
    const series = categories.map((date) => map[date]);
    const formattedCategories = categories.map(date => dayjs(date).format('MMM D'));

    return { series, categories: formattedCategories };
  }, [eventOrders, selectedEvent]);

  // Update eventOrders and totalRevenue when selectedEvent or data changes
  useEffect(() => {
    if (selectedEvent && data?.length) {
      const filtered = data.filter((order) => order.event?.id === selectedEvent.id);
      setEventOrders(filtered);
      setTotalRevenue(
        filtered
          .filter((order) => order.status === 'paid')
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      );
    } else {
      setEventOrders([]);
      setTotalRevenue(0);
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

  const handlePriceSortToggle = () => {
    setPriceSort((prev) => {
      if (prev === 'desc') return 'asc';
      if (prev === 'asc') return null;
      return 'desc';
    });
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
      return (
        event.name.toLowerCase().includes(query)
      );
    });

    return (
      <Container maxWidth="md" sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1, color: textColor, fontWeight: 700, fontSize: 22 }}>
            Select an Event
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}>
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
                <Iconify icon="eva:search-fill" sx={{ color: theme.palette.mode === 'light' ? '#888' : '#aaa', width: 20, height: 20, mr: 1 }} />
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
          {filteredEvents.map((event) => (
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
                        bgcolor: 'background.neutral',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        component="img"
                        src={event.eventSetting?.eventLogo || "/logo/nexea.png"}
                        alt={event.name}
                        sx={{
                          width: '70%',
                          height: '70%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>

                    {/* Event Details */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 600, fontSize: 16 }}>
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

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="eva:calendar-outline" width={14} sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: '0.75rem' }}>
                            {dayjs(event.date).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="eva:clock-outline" width={14} sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: '0.75rem' }}>
                            {dayjs(event.date).format('h:mm A')}
                          </Typography>
                        </Box>
                        {event.personInCharge && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Iconify icon="eva:person-outline" width={14} sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: '0.75rem' }}>
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
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', display: 'block', mb: 0.25 }}>
                            Total Orders
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 600 }}>
                              {data?.filter(order => order.event?.id === event.id).length || 0}
                            </Typography>
                            {(() => {
                              const allOrders = data?.filter(order => order.event?.id === event.id) || [];
                              const last7Days = allOrders.filter(order => 
                                dayjs(order.createdAt).isAfter(dayjs().subtract(7, 'days'))
                              );
                              const prev7Days = allOrders.filter(order => 
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
                                  <Tooltip title={`${Math.abs(trend)} ${trendText} orders compared to previous 7 days`}>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <Iconify icon={trendIcon} width={16} sx={{ color: trendColor }} />
                                    </Box>
                                  </Tooltip>
                                );
                              }
                              return null;
                            })()}
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', display: 'block', mb: 0.25 }}>
                            Revenue
                          </Typography>
                          <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 600 }}>
                            {new Intl.NumberFormat('en-MY', { 
                              style: 'currency', 
                              currency: 'MYR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(
                              data?.filter(order => order.event?.id === event.id && order.status === 'paid')
                                .reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0
                            )}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', display: 'block', mb: 0.25 }}>
                            Attendees
                          </Typography>
                          <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 600 }}>
                            {data?.filter(order => order.event?.id === event.id)
                              .reduce((sum, order) => sum + (order.attendees?.length || 0), 0) || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Arrow Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                      <Iconify icon="eva:arrow-ios-forward-fill" width={20} sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {(!eventData?.events || filteredEvents.length === 0) && (
          <EmptyContent
            title={searchQuery ? "No Matching Events" : "No Events Found"}
            description={searchQuery ? "Try adjusting your search terms" : "There are no events available at the moment."}
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
            router.push('/dashboard/order');
          }} 
          sx={{ color: iconColor, mr: 1, p: 0.5 }}
        >
          <Iconify icon="eva:arrow-back-fill" width={20} />
        </IconButton>
        <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, fontSize: 18 }}>
          {selectedEvent.name}
        </Typography>
      </Box>
      {/* Statistics and Revenue/Order Graphs */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <Card sx={{ flex: 1, minWidth: 180, borderRadius: 2, boxShadow: 0, border: `1px solid ${borderColor}`, bgcolor: cardBgColor }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: 12 }}>Total Revenue</Typography>
            <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, fontSize: 22, mb: 1 }}>
              {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(totalRevenue)}
            </Typography>
            <Box sx={{ width: '100%', minWidth: 120, maxWidth: '100%', mx: 'auto', height: 140, mt: 1 }}>
              <ReactApexChart
                options={{
                  chart: { 
                    type: 'area',
                    height: 140,
                    toolbar: { show: false },
                    zoom: { enabled: false },
                    animations: {
                      enabled: true,
                      easing: 'easeinout',
                      speed: 800,
                    },
                    parentHeightOffset: 0
                  },
                  xaxis: { 
                    categories: revenueChart.categories,
                    labels: { 
                      style: { 
                        fontSize: '11px', 
                        colors: theme.palette.mode === 'light' ? '#666' : '#bbb',
                        fontWeight: 500
                      },
                      rotate: -45,
                      rotateAlways: false,
                      hideOverlappingLabels: true,
                      offsetY: 2
                    },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                  },
                  yaxis: { 
                    labels: { 
                      style: { 
                        fontSize: '11px', 
                        colors: theme.palette.mode === 'light' ? '#666' : '#bbb',
                        fontWeight: 500
                      },
                      formatter: (value) => `RM ${value.toFixed(0)}`,
                      offsetX: -2
                    },
                    tickAmount: 4,
                    min: 0,
                    forceNiceScale: true
                  },
                  grid: { 
                    show: true,
                    borderColor: theme.palette.mode === 'light' ? '#f0f0f0' : '#333',
                    strokeDashArray: 3,
                    xaxis: { lines: { show: false } },
                    padding: {
                      top: 0,
                      right: 15,
                      bottom: 0,
                      left: 5
                    }
                  },
                  dataLabels: { enabled: false },
                  tooltip: { 
                    enabled: true,
                    shared: true,
                    intersect: false,
                    y: { formatter: (val) => `RM ${val.toFixed(2)}` },
                    theme: theme.palette.mode,
                    style: {
                      fontSize: '12px',
                      fontFamily: theme.typography.fontFamily,
                    }
                  },
                  colors: [theme.palette.primary.main],
                  markers: {
                    size: 0,
                    strokeColors: theme.palette.background.paper,
                    strokeWidth: 2,
                    hover: { size: 6 }
                  },
                  stroke: { 
                    curve: 'smooth', 
                    width: 2,
                    lineCap: 'round'
                  },
                }}
                series={[{ name: 'Revenue', data: revenueChart.series }]}
                type="area"
                height={140}
              />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 180, borderRadius: 2, boxShadow: 0, border: `1px solid ${borderColor}`, bgcolor: cardBgColor }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: 12 }}>Total Orders (Paid & Free)</Typography>
            <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, fontSize: 22, mb: 1 }}>
              {eventOrders.filter(order => 
                order.status === 'paid' || (order.status !== 'cancelled' && Number(order.totalAmount) === 0)
              ).length}
            </Typography>
            <Box sx={{ width: '100%', minWidth: 120, maxWidth: '100%', mx: 'auto', height: 140, mt: 1 }}>
              <ReactApexChart
                options={{
                  chart: { 
                    type: 'area',
                    height: 140,
                    toolbar: { show: false },
                    zoom: { enabled: false },
                    animations: {
                      enabled: true,
                      easing: 'easeinout',
                      speed: 800,
                    },
                    parentHeightOffset: 0
                  },
                  xaxis: { 
                    categories: orderCountChart.categories,
                    labels: { 
                      style: { 
                        fontSize: '11px', 
                        colors: theme.palette.mode === 'light' ? '#666' : '#bbb',
                        fontWeight: 500
                      },
                      rotate: -45,
                      rotateAlways: false,
                      hideOverlappingLabels: true,
                      offsetY: 2
                    },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                  },
                  yaxis: { 
                    labels: { 
                      style: { 
                        fontSize: '11px', 
                        colors: theme.palette.mode === 'light' ? '#666' : '#bbb',
                        fontWeight: 500
                      },
                      formatter: (value) => Math.round(value),
                      offsetX: -2
                    },
                    tickAmount: 4,
                    min: 0,
                    forceNiceScale: true
                  },
                  grid: { 
                    show: true,
                    borderColor: theme.palette.mode === 'light' ? '#f0f0f0' : '#333',
                    strokeDashArray: 3,
                    xaxis: { lines: { show: false } },
                    padding: {
                      top: 0,
                      right: 15,
                      bottom: 0,
                      left: 5
                    }
                  },
                  dataLabels: { enabled: false },
                  tooltip: { 
                    enabled: true,
                    shared: true,
                    intersect: false,
                    y: { formatter: (val) => `${Math.round(val)} orders` },
                    theme: theme.palette.mode,
                    style: {
                      fontSize: '12px',
                      fontFamily: theme.typography.fontFamily,
                    }
                  },
                  colors: [theme.palette.primary.main],
                  markers: {
                    size: 0,
                    strokeColors: theme.palette.background.paper,
                    strokeWidth: 2,
                    hover: { size: 6 }
                  },
                  stroke: { 
                    curve: 'smooth', 
                    width: 2,
                    lineCap: 'round'
                  },
                }}
                series={[{ name: 'Confirmed Orders', data: orderCountChart.series }]}
                type="area"
                height={140}
              />
            </Box>
          </CardContent>
        </Card>
      </Stack>
      {/* Search and Status Filter */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'flex-start', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2, 
          gap: 2 
        }}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search Orders"
          InputProps={{
            startAdornment: (
              <Iconify icon="eva:search-fill" sx={{ color: theme.palette.mode === 'light' ? '#888' : '#aaa', width: 18, height: 18, mr: 1 }} />
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
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-start' },
            gap: 1,
            width: '100%'
          }}
        >
          {['All', 'Paid', 'Pending', 'Cancelled', 'Free'].map((status) => {
            // Calculate count for each status
            let count = eventOrders.length; // Default for 'All'
            if (status === 'Paid') {
              count = eventOrders.filter(order => order.status === 'paid' && Number(order.totalAmount) > 0).length;
            } else if (status === 'Pending') {
              count = eventOrders.filter(order => order.status === 'pending').length;
            } else if (status === 'Cancelled') {
              count = eventOrders.filter(order => order.status === 'cancelled').length;
            } else if (status === 'Free') {
              count = eventOrders.filter(order => order.status === 'paid' && Number(order.totalAmount) === 0).length;
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
                    return theme.palette.mode === 'light' ? '#f3f3f3' : '#333';
                  })(),
                  borderColor,
                  borderRadius: 1,
                  minWidth: 'auto',
                  px: 1.5,
                  '&:hover': { 
                    bgcolor: (() => {
                      if (statusFilter === status) {
                        return theme.palette.mode === 'light' ? '#222' : '#ddd';
                      }
                      return theme.palette.mode === 'light' ? '#e0e0e0' : '#444';
                    })(),
                    borderRight: `1px solid ${borderColor}`,
                    zIndex: 1,
                  },
                }}
              >
                {status} ({count})
              </Button>
            );
          })}
        </Box>

    {/* Download CSV Button */}
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
            borderColor: borderColor,
          },
        }}
      >
        Export
      </Button>

      </Box>
      {/* Orders Table */}
      <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: 2, bgcolor: cardBgColor, overflow: 'hidden' }}>
        {/* Header row for desktop */}
        <Stack 
          direction="row" 
          alignItems="center" 
          sx={{ 
            px: 2, 
            py: 1, 
            bgcolor: hoverBg, 
            display: { xs: 'none', md: 'flex' } 
          }}
        >
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>Order ID</Typography>
          <Typography sx={{ width: '20%', color: textColor, fontWeight: 600, fontSize: 13 }}>Buyer Name</Typography>
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>Discount Code</Typography>
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>Order Date</Typography>
          <Box
            sx={{ width: '15%', display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            onClick={handlePriceSortToggle}
          >
            <Typography sx={{ color: textColor, fontWeight: 600, fontSize: 13, mr: 0.5 }}>Price (RM)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.2 }}>
              <ArrowDropUpIcon fontSize="small" sx={{ color: priceSort === 'asc' ? '#111' : '#bbb', mb: '-6px' }} />
              <ArrowDropDownIcon fontSize="small" sx={{ color: priceSort === 'desc' ? '#111' : '#bbb', mt: '-6px' }} />
            </Box>
          </Box>
          <Typography sx={{ width: '15%', color: textColor, fontWeight: 600, fontSize: 13 }}>Order Status</Typography>
          <Typography sx={{ width: '5%', color: textColor, fontWeight: 600, fontSize: 13 }}>Actions</Typography>
        </Stack>
        <Stack>
          {sortedEventOrders
            .filter((order) => {
              const q = (search || '').toLowerCase().trim();
              const matchesName = String(order.buyerName || order.buyer?.name || '').toLowerCase().includes(q);
              let matchesStatus = true;
              if (statusFilter === 'Paid') matchesStatus = (order.status || '').toLowerCase() === 'paid' && Number(order.totalAmount) > 0;
              else if (statusFilter === 'Pending') matchesStatus = (order.status || '').toLowerCase() === 'pending';
              else if (statusFilter === 'Cancelled') matchesStatus = (order.status || '').toLowerCase() === 'cancelled';
              else if (statusFilter === 'Free') matchesStatus = (order.status || '').toLowerCase() === 'paid' &&  Number(order.totalAmount) === 0;
              // 'All' shows all
              return matchesName && matchesStatus;
            })
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((order) => {
              let statusConfig = { color: textColor, icon: 'eva:clock-fill' };
              if (order.status === 'paid') statusConfig = { color: '#229A16', icon: 'eva:checkmark-circle-2-fill' };
              else if (order.status === 'pending') statusConfig = { color: '#B78103', icon: 'eva:clock-fill' };
              else if (order.status === 'failed') statusConfig = { color: '#B72136', icon: 'ic:outline-block' };
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
                  <Box
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
                  />

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
                      <Typography sx={{ color: textColor, fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                        {order.orderNumber}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon={statusConfig.icon} sx={{ width: 14, height: 14, color: statusConfig.color }} />
                        <Typography variant="caption" sx={{ color: statusConfig.color, fontWeight: 600, fontSize: 13 }}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>Buyer:</Typography>
                      <Typography sx={{ color: textColor, fontSize: 13, fontWeight: 500 }}>{order.buyerName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>Price:</Typography>
                      <Typography sx={{ color: textColor, fontSize: 13, fontWeight: 500 }}>RM {order.totalAmount?.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>Date:</Typography>
                      <Typography sx={{ color: textColor, fontSize: 13 }}>{dayjs(order.createdAt).format('LL')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>Discount:</Typography>
                      <Typography sx={{ color: textColor, fontSize: 13 }}>{order?.discountCode?.code || 'N/A'}</Typography>
                    </Box>
                    <Box 
                      className="action-buttons"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        mt: 1,
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(paths.dashboard.order.details(order.id));
                          }} 
                          sx={{ color: iconColor, p: 0.5 }}
                        >
                          <Iconify icon="eva:info-outline" width={16} height={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={order.status !== 'paid' ? 'Resend only for Paid orders' : 'Resend Confirmation Email'}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenResendDialog(order);
                          }} 
                          sx={{ color: iconColor, p: 0.5 }} 
                          disabled={order.status !== 'paid'}
                        >
                          <Iconify icon="eva:email-outline" width={16} height={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* Desktop layout - row style */}
                  <Typography sx={{ width: '15%', color: textColor, fontFamily: 'monospace', fontWeight: 600, fontSize: 13, display: { xs: 'none', md: 'block' } }}>{order.orderNumber}</Typography>
                  <Typography sx={{ width: '20%', color: textColor, fontSize: 13, display: { xs: 'none', md: 'block' } }}>{order.buyerName}</Typography>
                  <Typography sx={{ width: '15%', color: textColor, fontSize: 13, display: { xs: 'none', md: 'block' } }}>{order?.discountCode?.code || 'N/A'}</Typography>
                  <Typography sx={{ width: '15%', color: textColor, fontSize: 13, display: { xs: 'none', md: 'block' } }}>{dayjs(order.createdAt).format('LL')}</Typography>
                  <Typography sx={{ width: '15%', color: textColor, fontSize: 13, display: { xs: 'none', md: 'block' } }}>RM {order.totalAmount?.toFixed(2)}</Typography>
                  <Box sx={{ width: '15%', display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                    <Iconify icon={statusConfig.icon} sx={{ width: 14, height: 14, color: statusConfig.color }} />
                    <Typography variant="caption" sx={{ color: statusConfig.color, fontWeight: 600, fontSize: 13 }}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}
                    </Typography>
                  </Box>
                  <Box 
                    className="action-buttons"
                    sx={{ 
                      width: '5%', 
                      display: { xs: 'none', md: 'flex' }, 
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(paths.dashboard.order.details(order.id));
                        }} 
                        sx={{ color: iconColor, p: 0.5 }}
                      >
                        <Iconify icon="eva:info-outline" width={16} height={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={order.status !== 'paid' ? 'Resend only for Paid orders' : 'Resend Confirmation Email'}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenResendDialog(order);
                        }} 
                        sx={{ color: iconColor, p: 0.5 }} 
                        disabled={order.status !== 'paid'}
                      >
                        <Iconify icon="eva:email-outline" width={16} height={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
              );
            })}
        </Stack>
        <TablePaginationCustom
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={eventOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
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
                  bgcolor:  theme.palette.background.neutral,
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
            borderColor:  (theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748'),
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseResendDialog}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              borderColor:  (theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568'),
              color:  (theme.palette.mode === 'light' ? '#64748b' : '#a0aec0'),
              borderWidth: '1.5px',
              '&:hover': {
                backgroundColor: 
                  theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(74, 85, 104, 0.2)',
                borderColor:  (theme.palette.mode === 'light' ? '#cbd5e1' : '#718096'),
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
