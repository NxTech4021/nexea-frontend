import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

import {
  Box,
  Card,
  Stack,
  alpha,
  Button,
  Select,
  MenuItem,
  useTheme,
  Typography,
  CardContent,
} from '@mui/material';

import Iconify from 'src/components/iconify';

import DailyPerformance from './daily-performance';

const RevenueOrders = ({ 
  paidOrders, 
  freeOrders, 
  paidOrderRevenue, 
  paidTicketQuantity, 
  freeTicketQuantity, 
  trendData, 
  revenueTimeRange, 
  onTimeRangeChange 
}) => {
  const theme = useTheme();

  // Revenue chart data (dynamic time range)
  const revenueChartData = useMemo(() => {
    const now = dayjs();
    let days;

    if (revenueTimeRange === 'all') {
      // Get all unique dates from both paid and free orders
      const allDates = [
        ...new Set([
          ...paidOrders.map((order) => dayjs(order.createdAt).format('YYYY-MM-DD')),
          ...freeOrders.map((order) => dayjs(order.createdAt).format('YYYY-MM-DD')),
        ]),
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

    const ticketSalesByDay = days.map((day) => {
      // Include both paid and free orders for total registrations
      const dayPaidOrders = paidOrders.filter(
        (order) => dayjs(order.createdAt).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
      );
      const dayFreeOrders = freeOrders.filter(
        (order) => dayjs(order.createdAt).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
      );
      
      const dayPaidTickets = dayPaidOrders.reduce((sum, order) => sum + (order.attendees?.length || 0), 0);
      const dayFreeTickets = dayFreeOrders.reduce((sum, order) => sum + (order.attendees?.length || 0), 0);
      
      return dayPaidTickets + dayFreeTickets;
    });

    const categories = days.map((day) => day.format('MMM D'));

    // Normalize data to different ranges for visual separation
    const maxRevenue = Math.max(...revenueByDay);
    const maxOrders = Math.max(...orderCountByDay);
    const maxTickets = Math.max(...ticketSalesByDay);

    // Scale revenue to upper range (60-100) only if there's revenue, otherwise keep it flat
    const normalizedRevenue = revenueByDay.map((value) => {
      if (maxRevenue > 0 && value > 0) {
        return 60 + (value / maxRevenue) * 40;
      }
      return 0; // Flat when revenue is 0
    });

    // Scale orders to middle range (30-55)
    const normalizedOrders = orderCountByDay.map((value) => {
      if (maxOrders > 0) {
        return value > 0 ? 30 + (value / maxOrders) * 25 : 0; // 0 orders at very bottom
      }
      return 0; // No orders at all
    });

    // Scale ticket sales to lower range (0-25)
    const normalizedTickets = ticketSalesByDay.map((value) => {
      if (maxTickets > 0) {
        return value > 0 ? (value / maxTickets) * 25 : 0; // 0 tickets at very bottom
      }
      return 0; // No tickets at all
    });

    return {
      series: [
        { name: 'Revenue', data: normalizedRevenue, type: 'area' },
        { name: 'Paid Orders', data: normalizedOrders, type: 'area' },
        { name: 'Total Registrations', data: normalizedTickets, type: 'area' },
      ],
      categories,
      originalData: {
        revenue: revenueByDay,
        orders: orderCountByDay,
        tickets: ticketSalesByDay,
      },
    };
  }, [paidOrders, freeOrders, revenueTimeRange]);

  return (
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
          {/* Header Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3
            }}>
              {/* Main Stats */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify 
                        icon="eva:trending-up-outline" 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          color: theme.palette.text.secondary 
                        }} 
                      />
                      <Typography
                        fontSize={12}
                        color={theme.palette.text.secondary}
                        fontWeight={600}
                        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                      >
                        Revenue & Orders
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      px: 1.5,
                      py: 0.5,
                      bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b',
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.mode === 'light' ? '#e2e8f0' : '#334155'}`
                    }}>
                      <Typography
                        fontSize={10}
                        color={theme.palette.text.secondary}
                        fontWeight={500}
                      >
                        {revenueTimeRange === 'all' ? 'All Time' : `Last ${revenueTimeRange} days`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                  
                {/* Total Revenue - Largest */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    fontSize={32}
                    color={theme.palette.text.primary}
                    fontWeight={700}
                    sx={{ mb: 0.5 }}
                  >
                    {new Intl.NumberFormat('en-MY', {
                      minimumFractionDigits: 2,
                      style: 'currency',
                      currency: 'MYR',
                    }).format(paidOrderRevenue || 0)}
                  </Typography>
                  <Typography
                    fontSize={14}
                    color={theme.palette.text.secondary}
                    fontWeight={400}
                  >
                    Total Revenue
                  </Typography>
                </Box>

                {/* Secondary Stats - Equal Size */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 4,
                  flexWrap: 'wrap'
                }}>
                  <Box>
                    <Typography
                      fontSize={20}
                      color={theme.palette.text.primary}
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      {paidOrders.length}
                    </Typography>
                    <Typography
                      fontSize={12}
                      color={theme.palette.text.secondary}
                      fontWeight={400}
                    >
                      Paid Orders
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      fontSize={20}
                      color={theme.palette.text.primary}
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      {paidTicketQuantity + freeTicketQuantity}
                    </Typography>
                    <Typography
                      fontSize={12}
                      color={theme.palette.text.secondary}
                      fontWeight={400}
                    >
                      Total Registrations
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Time Range Controls - Separate */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 1
              }}>
                
                {/* Desktop/Tablet: Button Group */}
                <Box sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  bgcolor: theme.palette.action.hover,
                  borderRadius: 2,
                  p: 0.5,
                  gap: 0
                }}>
                  {[
                    { label: 'Last 7 days', shortLabel: '7d', value: 7 },
                    { label: 'Last 30 days', shortLabel: '30d', value: 30 },
                    { label: 'All Time', shortLabel: 'All', value: 'all' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      size="small"
                      variant="text"
                      onClick={() => onTimeRangeChange(option.value)}
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
                    onChange={(e) => onTimeRangeChange(e.target.value)}
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
              </Box>
            </Box>
            
            {/* Daily Performance Comparison */}
            <DailyPerformance trendData={trendData} />
          </Box>

          {/* Revenue and Orders Combined Chart */}
          <Box sx={{ width: '100%', height: { xs: 250, sm: 200 }, mt: 2 }}>
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
                    },
                    rotate: -45,
                    maxHeight: 60,
                    trim: true,
                    hideOverlappingLabels: true,
                    show: true,
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
                  width: [2, 2, 2],
                  lineCap: 'round',
                },
                colors: [theme.palette.primary.main, theme.palette.info.main, '#8B5CF6'],
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
                    opacityFrom: [0.6, 0.4, 0.3],
                    opacityTo: [0.1, 0.1, 0.1],
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
                    const tickets = revenueChartData.originalData.tickets[dataPointIndex];

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
                          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <div style="width: 8px; height: 8px; background: ${theme.palette.info.main}; border-radius: 50%;"></div>
                            <span style="font-size: 12px; color: ${theme.palette.text.secondary};">Orders:</span>
                            <span style="font-size: 12px; font-weight: 600; color: ${theme.palette.text.primary};">${orders}</span>
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                             <div style="width: 8px; height: 8px; background: #8B5CF6; border-radius: 50%;"></div>
                            <span style="font-size: 12px; color: ${theme.palette.text.secondary};">Total Registrations:</span>
                            <span style="font-size: 12px; font-weight: 600; color: ${theme.palette.text.primary};">${tickets}</span>
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
                responsive: [
                  {
                    breakpoint: 600,
                    options: {
                      chart: {
                        height: 250,
                      },
                      xaxis: {
                        labels: {
                          style: {
                            fontSize: '10px',
                          },
                          rotate: -60,
                          maxHeight: 80,
                          hideOverlappingLabels: true,
                          show: true,
                        },
                      },
                      legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '11px',
                      },
                    },
                  },
                ],
              }}
              height={200}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

RevenueOrders.propTypes = {
  paidOrders: PropTypes.array.isRequired,
  freeOrders: PropTypes.array.isRequired,
  paidOrderRevenue: PropTypes.number.isRequired,
  paidTicketQuantity: PropTypes.number.isRequired,
  freeTicketQuantity: PropTypes.number.isRequired,
  trendData: PropTypes.object.isRequired,
  revenueTimeRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onTimeRangeChange: PropTypes.func.isRequired,
};

export default RevenueOrders;
