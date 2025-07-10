import dayjs from 'dayjs';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Typography, CardContent } from '@mui/material';

export default function RevenueChart({ eventOrders, selectedEvent, dateRange }) {
  const theme = useTheme();

  // Revenue chart data for selected event
  const revenueChart = useMemo(() => {
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
    const filteredOrders = eventOrders.filter((order) => {
      const orderDate = dayjs(order.createdAt);
      return (
        orderDate.isAfter(startDate.subtract(1, 'day')) && orderDate.isBefore(endDate.add(1, 'day'))
      );
    });

    // Group by date (YYYY-MM-DD) and only include dates with revenue
    const map = {};
    filteredOrders.forEach((order) => {
      if (order.status === 'paid') {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        map[date] = (map[date] || 0) + (order.totalAmount || 0);
      }
    });

    // Generate all dates in range to show gaps
    const dates = [];
    let currentDate = startDate;
    while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    const series = dates.map((date) => map[date] || 0);
    const formattedCategories = dates.map((date) => dayjs(date).format('MMM D'));

    return {
      series,
      categories: formattedCategories,
      rawDates: dates,
    };
  }, [eventOrders, selectedEvent, dateRange]);

  // const totalRevenue = useMemo(
  //   () =>
  //     eventOrders
  //       .filter((order) => order.status === 'paid')
  //       .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
  //   [eventOrders]
  // );

  const totalRevenue = useMemo(() => {
    const orders = eventOrders.filter((a) => a?.status === 'paid' && a.totalAmount !== 0) || [];
    // const attendees = orders?.flatMap((a) => a.attendees);

    // const discount = orders.reduce((acc, curr) => acc + (curr.discountAmount ?? 0), 0);

    // const totalTicketPrice = attendees.reduce(
    //   (acc, cur) => acc + (cur.ticket.price ?? 0) + (cur.ticket.ticketAddOn?.price ?? 0),
    //   0
    // );

    return orders?.reduce((acc, cur) => acc + (cur?.totalAmount ?? 0), 0);
  }, [eventOrders]);

  const textColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const borderColor = theme.palette.mode === 'light' ? '#eee' : '#333';
  const cardBgColor = theme.palette.mode === 'light' ? '#fff' : '#1e1e1e';

  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 180,
        borderRadius: 2,
        boxShadow: 0,
        border: `1px solid ${borderColor}`,
        bgcolor: cardBgColor,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa', fontSize: 12 }}
        >
          Total Revenue
        </Typography>
        <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, fontSize: 22, mb: 1 }}>
          {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
            totalRevenue
          )}
        </Typography>
        <Box
          sx={{ width: '100%', minWidth: 120, maxWidth: '100%', mx: 'auto', height: 280, mt: 1 }}
        >
          <ReactApexChart
            options={{
              chart: {
                type: 'area',
                height: 240,
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
                  autoSelected: 'zoom',
                },
                zoom: {
                  enabled: true,
                  type: 'x',
                  autoScaleYaxis: true,
                },
                animations: {
                  enabled: true,
                  easing: 'easeinout',
                  speed: 800,
                },
                parentHeightOffset: 0,
              },
              xaxis: {
                categories: revenueChart.categories,
                labels: {
                  style: {
                    fontSize: '11px',
                    colors: theme.palette.mode === 'light' ? '#666' : '#bbb',
                    fontWeight: 500,
                  },
                  rotate: -45,
                  rotateAlways: false,
                  hideOverlappingLabels: true,
                  offsetY: 2,
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
              },
              yaxis: {
                labels: {
                  style: {
                    fontSize: '11px',
                    colors: theme.palette.mode === 'light' ? '#666' : '#bbb',
                    fontWeight: 500,
                  },
                  formatter: (value) => `RM ${value.toFixed(0)}`,
                  offsetX: -2,
                },
                tickAmount: 4,
                min: 0,
                forceNiceScale: true,
              },
              grid: {
                show: true,
                borderColor: theme.palette.mode === 'light' ? '#f0f0f0' : '#333',
                xaxis: { lines: { show: false } },
                padding: {
                  top: 0,
                  right: 15,
                  bottom: 0,
                  left: 5,
                },
              },
              dataLabels: { enabled: false },
              tooltip: {
                enabled: true,
                shared: true,
                intersect: false,
                custom({ series, seriesIndex, dataPointIndex, w }) {
                  const date = w.globals.categoryLabels[dataPointIndex];
                  const value = series[seriesIndex][dataPointIndex];

                  return `
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
                      <div style="
                        display: flex;
                        align-items: center;
                        font-size: 12px;
                      ">
                        <div style="
                          width: 8px;
                          height: 8px;
                          border-radius: 2px;
                          background: ${theme.palette.primary.main};
                          margin-right: 8px;
                        "></div>
                        <span style="
                          color: ${theme.palette.mode === 'light' ? '#666' : '#bbb'};
                          margin-right: 6px;
                        ">Revenue:</span>
                        <span style="
                          font-weight: 600;
                          color: ${theme.palette.mode === 'light' ? '#333' : '#fff'};
                        ">RM ${value.toFixed(2)}</span>
                      </div>
                    </div>
                  `;
                },
              },
              colors: [theme.palette.primary.main],
              markers: {
                size: 0,
                strokeColors: theme.palette.background.paper,
                strokeWidth: 2,
                hover: { size: 6 },
              },
              stroke: {
                curve: 'smooth',
                width: 2,
                lineCap: 'round',
              },
            }}
            series={[{ name: 'Revenue', data: revenueChart.series }]}
            type="area"
            height={240}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

RevenueChart.propTypes = {
  eventOrders: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedEvent: PropTypes.object,
  dateRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
