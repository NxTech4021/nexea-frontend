import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

import {
  Box,
  Card,
  Stack,
  alpha,
  useTheme,
  Typography,
  CardContent,
} from '@mui/material';

import Iconify from 'src/components/iconify';

const TotalTickets = ({ 
  paidTicketQuantity, 
  freeTicketQuantity, 
  addOnsQuantity, 
  revenueTimeRange 
}) => {
  const theme = useTheme();

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
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify 
                  icon="eva:pricetags-outline" 
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
                  Tickets Sold
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
          <Box sx={{ width: '100%', flex: 1, mt: 2, minHeight: 200 }}>
            <ReactApexChart
              type="bar"
              series={ticketsChartData.series}
              options={{
                chart: {
                  height: '100%',
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
              height="100%"
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

TotalTickets.propTypes = {
  paidTicketQuantity: PropTypes.number.isRequired,
  freeTicketQuantity: PropTypes.number.isRequired,
  addOnsQuantity: PropTypes.number.isRequired,
  revenueTimeRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TotalTickets;
