import dayjs from 'dayjs';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Typography, CardContent } from '@mui/material';

export default function OrdersChart({ eventOrders, selectedEvent, dateRange }) {
  const theme = useTheme();

  // Add order count chart data with 3 series
  const orderCountChart = useMemo(() => {
    if (!selectedEvent || !eventOrders.length) return { series: [], categories: [] };

    // Calculate date range
    let startDate;
    let endDate;
    const now = dayjs();
    
    switch (dateRange) {
      case 'thisWeek':
        startDate = now.startOf('week');
        endDate = now.endOf('week');
        break;
      case 7:
        startDate = now.subtract(6, 'days').startOf('day');
        endDate = now.endOf('day');
        break;
      case 14:
        startDate = now.subtract(13, 'days').startOf('day');
        endDate = now.endOf('day');
        break;
      case 30:
        startDate = now.subtract(29, 'days').startOf('day');
        endDate = now.endOf('day');
        break;
      default:
        startDate = now.startOf('week');
        endDate = now.endOf('week');
    }

    // Filter orders by date range
    const filteredOrders = eventOrders.filter(order => {
      const orderDate = dayjs(order.createdAt);
      return orderDate.isAfter(startDate.subtract(1, 'day')) && orderDate.isBefore(endDate.add(1, 'day'));
    });

    // Generate all dates in range to show gaps
    const dates = [];
    let currentDate = startDate;
    while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    // Group by date (YYYY-MM-DD) and categorize orders
    const dateMap = {};
    dates.forEach(date => {
      dateMap[date] = {
        paidWithoutDiscount: 0,
        paidWithDiscount: 0,
        free: 0
      };
    });

    filteredOrders.forEach((order) => {
      if (order.status === 'paid' || (order.status !== 'cancelled' && Number(order.totalAmount) === 0)) {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        if (dateMap[date]) {
          if (order.status === 'paid' && Number(order.totalAmount) > 0) {
            // Paid orders - check if discount code was used
            if (order.discountCode && order.discountCode.code) {
              dateMap[date].paidWithDiscount += 1;
            } else {
              dateMap[date].paidWithoutDiscount += 1;
            }
          } else if (order.status === 'paid' && Number(order.totalAmount) === 0) {
            // Free orders
            dateMap[date].free += 1;
          }
        }
      }
    });

    const formattedCategories = dates.map(date => dayjs(date).format('MMM D'));

    const paidWithoutDiscountSeries = dates.map(date => dateMap[date].paidWithoutDiscount);
    const paidWithDiscountSeries = dates.map(date => dateMap[date].paidWithDiscount);
    const freeSeries = dates.map(date => dateMap[date].free);

    const totalPaidWithoutDiscount = paidWithoutDiscountSeries.reduce((sum, val) => sum + val, 0);
    const totalPaidWithDiscount = paidWithDiscountSeries.reduce((sum, val) => sum + val, 0);
    const totalFree = freeSeries.reduce((sum, val) => sum + val, 0);

    return { 
      series: [
        { name: `Paid: ${totalPaidWithoutDiscount}`, data: paidWithoutDiscountSeries },
        { name: `Paid (with Discount): ${totalPaidWithDiscount}`, data: paidWithDiscountSeries },
        { name: `Free Orders: ${totalFree}`, data: freeSeries }
      ], 
      categories: formattedCategories,
      totals: {
        paid: totalPaidWithoutDiscount,
        discounted: totalPaidWithDiscount,
        free: totalFree
      }
    };
  }, [eventOrders, selectedEvent, dateRange]);

  const totalOrders = useMemo(() => 
    eventOrders.filter(order => 
      order.status === 'paid' || (order.status !== 'cancelled' && Number(order.totalAmount) === 0)
    ).length
  , [eventOrders]);

  const textColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const borderColor = theme.palette.mode === 'light' ? '#eee' : '#333';
  const cardBgColor = theme.palette.mode === 'light' ? '#fff' : '#1e1e1e';

  return (
    <Card sx={{ flex: 1, minWidth: 180, borderRadius: 2, boxShadow: 0, border: `1px solid ${borderColor}`, bgcolor: cardBgColor }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: 12 }}>
          Total Orders
        </Typography>
        <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, fontSize: 22, mb: 1 }}>
          {totalOrders}
        </Typography>
        <Box sx={{ width: '100%', minWidth: 120, maxWidth: '100%', mx: 'auto', height: 280, mt: 1 }}>
          <ReactApexChart
            options={{
              chart: { 
                type: 'area',
                height: 265,
                toolbar: { 
                  show: true,
                  tools: {
                    download: true,
                    selection: false,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                  },
                  autoSelected: 'zoom'
                },
                zoom: { 
                  enabled: true,
                  type: 'x',
                  autoScaleYaxis: true
                },
                animations: {
                  enabled: true,
                  easing: 'easeinout',
                  speed: 800,
                },
                parentHeightOffset: 0,
                stacked: false
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
                custom({ series, seriesIndex, dataPointIndex, w }) {
                  const date = w.globals.categoryLabels[dataPointIndex];
                  const seriesNames = ['Paid', 'Paid (with Discount)', 'Free Orders'];
                  const colors = [w.globals.colors[0], w.globals.colors[1], w.globals.colors[2]];
                  
                  let tooltipContent = `
                    <div style="
                      background: ${theme.palette.mode === 'light' ? '#fff' : '#1e1e1e'};
                      padding: 12px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                      font-family: ${theme.typography.fontFamily};
                      min-width: 140px;
                    ">
                      <div style="
                        font-size: 13px;
                        font-weight: 600;
                        color: ${theme.palette.mode === 'light' ? '#333' : '#fff'};
                        margin-bottom: 8px;
                        border-bottom: 1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#333'};
                        padding-bottom: 6px;
                      ">${date}</div>
                  `;
                  
                  series.forEach((seriesData, index) => {
                    const value = seriesData[dataPointIndex];
                    if (value > 0) {
                      tooltipContent += `
                        <div style="
                          display: flex;
                          align-items: center;
                          margin-bottom: 4px;
                          font-size: 12px;
                        ">
                          <div style="
                            width: 8px;
                            height: 8px;
                            border-radius: 2px;
                            background: ${colors[index]};
                            margin-right: 8px;
                          "></div>
                          <span style="
                            color: ${theme.palette.mode === 'light' ? '#666' : '#bbb'};
                            margin-right: 6px;
                          ">${seriesNames[index]}:</span>
                          <span style="
                            font-weight: 600;
                            color: ${theme.palette.mode === 'light' ? '#333' : '#fff'};
                          ">${value}</span>
                        </div>
                      `;
                    }
                  });
                  
                  tooltipContent += '</div>';
                  return tooltipContent;
                }
              },
              colors: [theme.palette.primary.main, '#3498DB', '#95A5A6'],
              markers: {
                size: 0,
                strokeColors: theme.palette.background.paper,
                strokeWidth: 2,
                hover: { size: 4 }
              },
              stroke: { 
                curve: 'smooth', 
                width: 2,
                lineCap: 'round'
              },
              fill: {
                type: 'gradient',
                gradient: {
                  shadeIntensity: 1,
                  opacityFrom: 0.7,
                  opacityTo: 0.2,
                  stops: [0, 100]
                }
              },
              legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '12px',
                fontFamily: theme.typography.fontFamily,
                fontWeight: 500,
                labels: {
                  colors: theme.palette.mode === 'light' ? '#666' : '#bbb',
                  useSeriesColors: false
                },
                markers: {
                  width: 14,
                  height: 14,
                  strokeWidth: 0,
                  radius: 3,
                  offsetX: -3,
                  fillColors: [theme.palette.primary.main, '#3498DB', '#95A5A6']
                },
                itemMargin: {
                  horizontal: 16,
                  vertical: 4
                },
                offsetY: 25,
                onItemClick: {
                  toggleDataSeries: true
                },
                onItemHover: {
                  highlightDataSeries: true
                }
              }
            }}
            series={orderCountChart.series}
            type="area"
            height={265}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

OrdersChart.propTypes = {
  eventOrders: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedEvent: PropTypes.object,
  dateRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}; 