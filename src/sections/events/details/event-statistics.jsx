import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import React, { useMemo, useState } from 'react';

import Grid from '@mui/material/Grid2';
import {
  Box,
  Card,
  Chip,
  Stack,
  alpha,
  Button,
  Select,
  MenuItem,
  useTheme,
  Typography,
  CardContent,
} from '@mui/material';

const StatCard = ({ title, value, subtitle, color }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        border: 1,
        borderColor: theme.palette.divider,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        backgroundImage:
          theme.palette.mode === 'light'
            ? 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)'
            : 'none',
      }}
    >
      <CardContent>
        <Stack spacing={0}>
          <Typography fontSize={14} color={theme.palette.text.secondary} fontWeight={400}>
            {title}
          </Typography>
          <Typography color={theme.palette.text.primary} fontSize={28} fontWeight={700}>
            {value}
          </Typography>
          {subtitle && (
            <Typography fontSize={14} color={theme.palette.text.primary} fontWeight={400} mt={2}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  color: PropTypes.string,
};

const ModernTable = ({ data: breakdownData, title, isAddOn = false }) => {
  const theme = useTheme();
  const entries = Object.entries(breakdownData);

  // Theme-aware colors
  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;
  const hoverBg = theme.palette.action.hover;
  const borderColor = theme.palette.divider;
  const cardBgColor = theme.palette.background.paper;

  if (entries.length === 0) {
    return (
      <Card
        sx={{
          border: 1,
          borderColor: theme.palette.divider,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          backgroundImage:
            theme.palette.mode === 'light'
              ? 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)'
              : 'none',
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography fontSize={14} color={theme.palette.text.secondary} fontWeight={600}>
              {title}
            </Typography>
            <Box
              sx={{
                py: 6,
                textAlign: 'center',
                color: theme.palette.text.secondary,
              }}
            >
              <Typography variant="body2">No data available</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        border: 1,
        borderColor: theme.palette.divider,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        backgroundImage:
          theme.palette.mode === 'light'
            ? 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)'
            : 'none',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography fontSize={14} color={theme.palette.text.primary} fontWeight={600}>
            {title}
          </Typography>
          <Box
            sx={{
              border: `1px solid ${borderColor}`,
              borderRadius: 1,
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
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Typography sx={{ width: '30%', color: textColor, fontWeight: 600, fontSize: 13 }}>
                Type
              </Typography>
              <Typography
                sx={{
                  width: '17.5%',
                  color: textColor,
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                Paid
              </Typography>
              <Typography
                sx={{
                  width: '17.5%',
                  color: textColor,
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                Free
              </Typography>
              <Typography
                sx={{
                  width: '17.5%',
                  color: textColor,
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                Total
              </Typography>
              <Typography
                sx={{
                  width: '16.5%',
                  color: textColor,
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'right',
                }}
              >
                Revenue
              </Typography>
            </Stack>

            {/* Data rows */}
            <Stack>
              {entries.map(([type, stats], index) => (
                <Stack
                  key={type}
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  sx={{
                    p: 2,
                    borderBottom:
                      index === entries.length - 1 ? 'none' : `1px solid ${borderColor}`,
                    '&:hover': {
                      bgcolor: hoverBg,
                    },
                  }}
                >
                  {/* Mobile layout - Card style */}
                  <Box
                    sx={{
                      display: { xs: 'flex', md: 'none' },
                      flexDirection: 'column',
                      width: '100%',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          sx={{
                            color: textColor,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {type}
                        </Typography>
                        {isAddOn && (
                          <Chip
                            label="Add-on"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: 'secondary.main',
                              border: 1,
                              borderColor: alpha(theme.palette.secondary.main, 0.3),
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        )}
                      </Stack>
                      <Typography sx={{ color: textColor, fontSize: 14, fontWeight: 600 }}>
                        RM{' '}
                        {stats.revenue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: secondaryTextColor, fontSize: 12 }}>
                        Paid:
                      </Typography>
                      <Typography sx={{ color: textColor, fontSize: 13, fontWeight: 500 }}>
                        {stats.paidQuantity}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: secondaryTextColor, fontSize: 12 }}>
                        Free:
                      </Typography>
                      <Typography sx={{ color: textColor, fontSize: 13, fontWeight: 500 }}>
                        {stats.freeQuantity}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: secondaryTextColor, fontSize: 12 }}>
                        Total:
                      </Typography>
                      <Typography sx={{ color: textColor, fontSize: 13, fontWeight: 500 }}>
                        {stats.paidQuantity + stats.freeQuantity}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Desktop layout - row style */}
                  <Box
                    sx={{
                      width: '30%',
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: textColor,
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      {type}
                    </Typography>
                    {isAddOn && (
                      <Chip
                        label="Add-on"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: 'secondary.main',
                          border: 1,
                          borderColor: alpha(theme.palette.secondary.main, 0.3),
                          '& .MuiChip-label': { px: 1 },
                          '&:hover': {
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: 'secondary.main',
                          },
                        }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      width: '17.5%',
                      display: { xs: 'none', md: 'flex' },
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 32,
                        height: 24,
                        px: 1,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {stats.paidQuantity}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      width: '17.5%',
                      display: { xs: 'none', md: 'flex' },
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 32,
                        height: 24,
                        px: 1,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {stats.freeQuantity}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      width: '17.5%',
                      display: { xs: 'none', md: 'flex' },
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 32,
                        height: 24,
                        px: 1,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {stats.paidQuantity + stats.freeQuantity}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      width: '17.5%',
                      display: { xs: 'none', md: 'flex' },
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1.5,
                        height: 24,
                        borderRadius: 1,
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}
                    >
                      RM{' '}
                      {stats.revenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Box>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

ModernTable.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  isAddOn: PropTypes.bool,
};

const EventStatistics = ({ data }) => {
  const theme = useTheme();
  const [revenueTimeRange, setRevenueTimeRange] = useState(7); // Default to 7 days

  // Calculate all orders with 'paid' status (includes both paid and free)
  const paidStatusOrders = data?.order?.filter((order) => order?.status === 'paid') || [];

  // Separate paid and free orders based on totalAmount
  const paidOrders = paidStatusOrders.filter((order) => Number(order.totalAmount) > 0);
  const freeOrders = paidStatusOrders.filter((order) => Number(order.totalAmount) === 0);

  // Get all attendees from paid status orders
  const allAttendees = paidStatusOrders.flatMap((order) => order.attendees) || [];
  const paidAttendees = paidOrders.flatMap((order) => order.attendees) || [];
  const freeAttendees = freeOrders.flatMap((order) => order.attendees) || [];

  // 1. Revenue of paid tickets
  const paidTicketRevenue = paidAttendees.reduce((acc, attendee) => {
    const ticketPrice = attendee.ticket?.price || 0;
    const addOnPrice = attendee.ticket?.ticketAddOn?.price || 0;
    return acc + ticketPrice + addOnPrice;
  }, 0);

  // 2. Revenue of paid orders
  const paidOrderRevenue = paidOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

  // 3. Quantity of all paid tickets
  const paidTicketQuantity = paidAttendees.length;

  // 4. Quantity of all free tickets
  const freeTicketQuantity = freeAttendees.length;

  // Revenue chart data (dynamic time range)
  const revenueChartData = useMemo(() => {
    const now = dayjs();
    let days;

    if (revenueTimeRange === 'all') {
      // Get all unique dates from orders
      const allDates = [
        ...new Set(paidOrders.map((order) => dayjs(order.createdAt).format('YYYY-MM-DD'))),
      ];
      const sortedDates = allDates.sort();
      days = sortedDates.map((date) => dayjs(date));
    } else {
      // Get last N days
      days = Array.from({ length: revenueTimeRange }, (_, i) => now.subtract(i, 'day')).reverse();
    }

    const revenueByDay = days.map((day) => {
      const dayRevenue = paidOrders
        .filter((order) => dayjs(order.createdAt).format('YYYY-MM-DD') === day.format('YYYY-MM-DD'))
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      return dayRevenue;
    });

    const orderCountByDay = days.map((day) => {
      const dayOrders = paidOrders.filter(
        (order) => dayjs(order.createdAt).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
      ).length;
      return dayOrders;
    });

    const categories = days.map((day) => day.format('MMM D'));

    // Normalize data to different ranges for visual separation
    const maxRevenue = Math.max(...revenueByDay);
    const maxOrders = Math.max(...orderCountByDay);

    // Scale revenue to upper half (50-100) only if there's revenue, otherwise keep it flat with orders
    const normalizedRevenue = revenueByDay.map((value) => {
      if (maxRevenue > 0 && value > 0) {
        return 50 + (value / maxRevenue) * 50;
      }
      return 0; // Flat when revenue is 0
    });

    // Scale orders to lower half (0-40)
    const normalizedOrders = orderCountByDay.map((value) =>
      maxOrders > 0 ? (value / maxOrders) * 40 : 0
    );

    return {
      series: [
        { name: 'Revenue', data: normalizedRevenue, type: 'area' },
        { name: 'Orders', data: normalizedOrders, type: 'area' },
      ],
      categories,
      originalData: {
        revenue: revenueByDay,
        orders: orderCountByDay,
      },
    };
  }, [paidOrders, revenueTimeRange]);

  // Calculate add-ons quantity
  const addOnsQuantity = allAttendees.filter(
    (attendee) => attendee.ticket?.ticketAddOn.addOn !== null
  ).length;

  // Tickets chart data (paid vs free vs add-ons)
  const ticketsChartData = useMemo(
    () => ({
      series: [
        {
          name: 'Paid Tickets',
          data: [paidTicketQuantity],
        },
        {
          name: 'Free Tickets',
          data: [freeTicketQuantity],
        },
        {
          name: 'Add-ons',
          data: [addOnsQuantity],
        },
      ],
      categories: ['Tickets'],
    }),
    [paidTicketQuantity, freeTicketQuantity, addOnsQuantity]
  );

  // Group tickets by type for detailed breakdown
  const ticketTypeBreakdown = allAttendees.reduce((acc, attendee) => {
    const ticketType = attendee.ticket?.ticketType?.title;
    const attendeeOrder = paidStatusOrders.find((order) =>
      order.attendees.some((orderAttendee) => orderAttendee.id === attendee.id)
    );

    // Check if this attendee is from a paid or free order
    const isFromPaidOrder = paidAttendees.includes(attendee);

    if (!ticketType || !attendeeOrder) return acc;

    if (!acc[ticketType]) {
      acc[ticketType] = {
        paidQuantity: 0,
        freeQuantity: 0,
        revenue: 0,
      };
    }

    if (isFromPaidOrder) {
      acc[ticketType].paidQuantity += 1;
      const orderTotalAttendees = attendeeOrder.attendees.length;
      const proportionalRevenue = (attendeeOrder.totalAmount || 0) / orderTotalAttendees;
      acc[ticketType].revenue += proportionalRevenue;
    } else {
      acc[ticketType].freeQuantity += 1;
    }

    return acc;
  }, {});

  // Add-on tickets breakdown
  const addOnBreakdown = allAttendees.reduce((acc, attendee) => {
    const addOnName = attendee.ticket?.ticketAddOn?.addOn?.name;
    const attendeeOrder = paidStatusOrders.find((order) =>
      order.attendees.some((orderAttendee) => orderAttendee.id === attendee.id)
    );

    // Check if this attendee is from a paid or free order
    const isFromPaidOrder = paidAttendees.includes(attendee);

    if (!addOnName || !attendeeOrder) return acc;

    if (!acc[addOnName]) {
      acc[addOnName] = {
        paidQuantity: 0,
        freeQuantity: 0,
        revenue: 0,
      };
    }

    if (isFromPaidOrder) {
      acc[addOnName].paidQuantity += 1;
      const addOnPrice = attendee.ticket?.ticketAddOn?.price || 0;
      const ticketPrice = attendee.ticket?.price || 0;
      const originalItemTotal = ticketPrice + addOnPrice;

      // Calculate order's original total before discounts/taxes
      const orderOriginalTotal = attendeeOrder.attendees.reduce((sum, orderAttendee) => {
        const orderTicketPrice = orderAttendee.ticket?.price || 0;
        const orderAddOnPrice = orderAttendee.ticket?.ticketAddOn?.price || 0;
        return sum + orderTicketPrice + orderAddOnPrice;
      }, 0);

      // Calculate add-on's proportional share of the actual paid amount
      if (orderOriginalTotal > 0 && originalItemTotal > 0) {
        const addOnProportion = addOnPrice / orderOriginalTotal;
        const proportionalRevenue = (attendeeOrder.totalAmount || 0) * addOnProportion;
        acc[addOnName].revenue += proportionalRevenue;
      }
    } else {
      acc[addOnName].freeQuantity += 1;
    }

    return acc;
  }, {});

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={3}>
        {/* Revenue and Tickets Charts */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                border: 1,
                borderColor: theme.palette.divider,
                borderRadius: 2,
                height: '100%',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <CardContent>
                <Stack spacing={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        fontSize={14}
                        color={theme.palette.text.secondary}
                        fontWeight={400}
                      >
                        Revenue & Orders
                      </Typography>
                      <Typography color={theme.palette.text.primary} fontSize={28} fontWeight={700}>
                        {new Intl.NumberFormat('en-MY', {
                          minimumFractionDigits: 2,
                          style: 'currency',
                          currency: 'MYR',
                        }).format(paidOrderRevenue || 0)}
                      </Typography>
                      <Typography
                        fontSize={14}
                        color={theme.palette.text.primary}
                        fontWeight={400}
                        mt={2}
                      >
                        From paid orders
                      </Typography>
                    </Box>

                    {/* Date Range Controls - Responsive */}
                    <>
                      {/* Desktop/Tablet: Button Group */}
                      <Box
                        sx={{
                          display: { xs: 'none', sm: 'flex' },
                          bgcolor: theme.palette.action.hover,
                          borderRadius: 2,
                          p: { sm: 0.25, md: 0.5 },
                          gap: 0,
                        }}
                      >
                        {[
                          { label: 'Last 7 days', shortLabel: '7d', value: 7 },
                          { label: 'Last 30 days', shortLabel: '30d', value: 30 },
                          { label: 'All Time', shortLabel: 'All', value: 'all' },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            size="small"
                            variant="text"
                            onClick={() => setRevenueTimeRange(option.value)}
                            sx={{
                              minWidth: 'auto',
                              px: { sm: 1, md: 2 },
                              py: { sm: 0.5, md: 1 },
                              fontSize: { sm: '0.75rem', md: '0.875rem' },
                              fontWeight: 500,
                              textTransform: 'none',
                              borderRadius: 1.5,
                              height: { sm: 32, md: 36 },
                              ...(revenueTimeRange === option.value
                                ? {
                                    bgcolor: theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                    boxShadow: theme.shadows[1],
                                  }
                                : {
                                    color: theme.palette.text.secondary,
                                  }),
                            }}
                          >
                            {/* Responsive label display */}
                            <Box component="span" sx={{ display: { sm: 'inline', lg: 'none' } }}>
                              {option.shortLabel}
                            </Box>
                            <Box component="span" sx={{ display: { sm: 'none', lg: 'inline' } }}>
                              {option.label}
                            </Box>
                          </Button>
                        ))}
                      </Box>

                      {/* Mobile: Dropdown */}
                      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                        <Select
                          value={revenueTimeRange}
                          onChange={(e) => setRevenueTimeRange(e.target.value)}
                          size="small"
                          sx={{
                            minWidth: 120,
                            height: 36,
                            bgcolor: theme.palette.action.hover,
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '& .MuiSelect-select': {
                              py: 1,
                              px: 2,
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: theme.palette.text.primary,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                          }}
                        >
                          <MenuItem value={7} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            Last 7 days
                          </MenuItem>
                          <MenuItem value={30} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            Last 30 days
                          </MenuItem>
                          <MenuItem value="all" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            All Time
                          </MenuItem>
                        </Select>
                      </Box>
                    </>
                  </Box>

                  {/* Revenue and Orders Combined Chart */}
                  <Box sx={{ width: '100%', height: 200, mt: 2 }}>
                    <ReactApexChart
                      type="area"
                      series={revenueChartData.series}
                      options={{
                        chart: {
                          height: 200,
                          type: 'area',
                          toolbar: { show: false },
                          zoom: { enabled: false },
                          animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                          },
                          background: 'transparent',
                        },
                        xaxis: {
                          categories: revenueChartData.categories,
                          labels: {
                            style: {
                              fontSize: '11px',
                              colors: theme.palette.text.secondary,
                              fontWeight: 500,
                              hideOverlappingLabels: true,
                            },
                          },
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                        },
                        yaxis: {
                          show: false,
                        },
                        grid: {
                          show: true,
                          borderColor: alpha(theme.palette.divider, 0.5),
                          strokeDashArray: 0,
                        },
                        stroke: {
                          curve: 'smooth',
                          width: [2, 2],
                          lineCap: 'round',
                        },
                        colors: [theme.palette.primary.main, theme.palette.info.main],
                        markers: {
                          size: 4,
                          strokeColors: theme.palette.background.paper,
                          strokeWidth: 2,
                          hover: { size: 6 },
                        },
                        dataLabels: {
                          enabled: false,
                        },
                        fill: {
                          type: 'gradient',
                          gradient: {
                            shadeIntensity: 1,
                            opacityFrom: [0.6, 0.4],
                            opacityTo: [0.1, 0.1],
                            stops: [50, 100],
                          },
                        },
                        tooltip: {
                          theme: theme.palette.mode,
                          shared: true,
                          intersect: false,
                          custom({ series, seriesIndex, dataPointIndex, w }) {
                            const date = w.globals.categoryLabels[dataPointIndex];
                            const revenue = revenueChartData.originalData.revenue[dataPointIndex];
                            const orders = revenueChartData.originalData.orders[dataPointIndex];

                            return `
                                <div style="padding: 12px; background: ${theme.palette.background.paper}; border-radius: 8px; box-shadow: ${theme.shadows[4]}; border: 1px solid ${theme.palette.divider};">
                                  <div style="font-size: 13px; font-weight: 600; color: ${theme.palette.text.primary}; margin-bottom: 8px;">
                                    ${date}
                                  </div>
                                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                    <div style="width: 8px; height: 8px; background: ${theme.palette.primary.main}; border-radius: 50%;"></div>
                                    <span style="font-size: 12px; color: ${theme.palette.text.secondary};">Revenue:</span>
                                    <span style="font-size: 12px; font-weight: 600; color: ${theme.palette.text.primary};">RM ${revenue.toFixed(2)}</span>
                                  </div>
                                  <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 8px; height: 8px; background: ${theme.palette.info.main}; border-radius: 50%;"></div>
                                    <span style="font-size: 12px; color: ${theme.palette.text.secondary};">Orders:</span>
                                    <span style="font-size: 12px; font-weight: 600; color: ${theme.palette.text.primary};">${orders}</span>
                                  </div>
                                </div>
                              `;
                          },
                        },
                        legend: {
                          show: true,
                          position: 'top',
                          horizontalAlign: 'right',
                          fontSize: '12px',
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 500,
                          labels: {
                            colors: theme.palette.text.secondary,
                          },
                          markers: {
                            width: 8,
                            height: 8,
                            radius: 2,
                          },
                          onItemHover: {
                            highlightDataSeries: true,
                          },
                        },
                      }}
                      height={200}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                border: 1,
                borderColor: theme.palette.divider,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <CardContent>
                <Stack spacing={0}>
                  <Typography fontSize={14} color={theme.palette.text.secondary} fontWeight={400}>
                    Tickets Sold
                  </Typography>
                  <Typography color={theme.palette.text.primary} fontSize={28} fontWeight={700}>
                    {(paidTicketQuantity + freeTicketQuantity + addOnsQuantity).toLocaleString()}
                  </Typography>
                  <Typography
                    fontSize={14}
                    color={theme.palette.text.primary}
                    fontWeight={400}
                    mt={2}
                  >
                    Total tickets distributed
                  </Typography>
                  <Stack direction="row" spacing={2} mt={1} flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: theme.palette.success.main,
                        }}
                      />
                      <Typography
                        fontSize={12}
                        color={theme.palette.text.secondary}
                        fontWeight={400}
                      >
                        Paid: {paidTicketQuantity.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: theme.palette.warning.main,
                        }}
                      />
                      <Typography
                        fontSize={12}
                        color={theme.palette.text.secondary}
                        fontWeight={400}
                      >
                        Free: {freeTicketQuantity.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: theme.palette.secondary.main,
                        }}
                      />
                      <Typography
                        fontSize={12}
                        color={theme.palette.text.secondary}
                        fontWeight={400}
                      >
                        Add-ons: {addOnsQuantity.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Tickets Bar Chart */}
                  <Box sx={{ width: '100%', height: 200, mt: 2 }}>
                    <ReactApexChart
                      type="bar"
                      series={ticketsChartData.series}
                      options={{
                        chart: {
                          height: 200,
                          type: 'bar',
                          toolbar: { show: false },
                          animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                          },
                          background: 'transparent',
                        },
                        plotOptions: {
                          bar: {
                            horizontal: false,
                            columnWidth: '60%',
                            borderRadius: 4,
                          },
                        },
                        xaxis: {
                          categories: ticketsChartData.categories,
                          labels: {
                            style: {
                              fontSize: '11px',
                              colors: theme.palette.text.secondary,
                              fontWeight: 500,
                            },
                          },
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                        },
                        yaxis: {
                          labels: {
                            style: {
                              fontSize: '11px',
                              colors: theme.palette.text.secondary,
                              fontWeight: 500,
                            },
                            formatter: (value) => Math.round(value),
                          },
                          min: 0,
                        },
                        grid: {
                          show: true,
                          borderColor: alpha(theme.palette.divider, 0.5),
                          strokeDashArray: 0,
                        },
                        colors: [
                          theme.palette.success.main,
                          theme.palette.warning.main,
                          theme.palette.secondary.main,
                        ],
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: '12px',
                            fontWeight: 600,
                            colors: [theme.palette.common.white],
                          },
                        },
                        tooltip: {
                          theme: theme.palette.mode,
                          y: {
                            formatter: (value) => `${value} tickets`,
                          },
                        },
                        legend: {
                          show: true,
                          position: 'bottom',
                          horizontalAlign: 'center',
                          fontSize: '12px',
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 500,
                          labels: {
                            colors: theme.palette.text.secondary,
                          },
                          markers: {
                            width: 12,
                            height: 12,
                            radius: 2,
                          },
                        },
                      }}
                      height={200}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Ticket Type Breakdown Table */}
        {(Object.keys(ticketTypeBreakdown).length > 0 ||
          Object.keys(addOnBreakdown).length > 0) && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: Object.keys(addOnBreakdown).length > 0 ? 6 : 12 }}>
              <ModernTable data={ticketTypeBreakdown} title="All Tickets" />
            </Grid>

            {/* Add-on Breakdown Table */}
            {Object.keys(addOnBreakdown).length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <ModernTable data={addOnBreakdown} title="Add-ons" isAddOn />
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

EventStatistics.propTypes = {
  data: PropTypes.object,
};

export default EventStatistics;
