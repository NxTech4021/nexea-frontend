import React from 'react';
import ReactApexChart from 'react-apexcharts';

import { Box, Card, useTheme, Typography, CardContent } from '@mui/material';

const ticketData = [
  {
    label: 'Startups',
    value: 72.72,
    count: 145,
    color: '#2196f3',
  },
  {
    label: 'Investors',
    value: 16.38,
    count: 34,
    color: '#ff9800',
  },
  {
    label: 'Speakers',
    value: 3.83,
    count: 8,
    color: '#4caf50',
  },
  {
    label: 'General',
    value: 2.42,
    count: 5,
    color: '#f44336',
  },
];

const TicketInformation = () => {
  const theme = useTheme();

  const chartOptions = {
    chart: {
      type: 'donut',
    },
    labels: ticketData.map((item) => item.label),
    colors: ticketData.map((item) => item.color),
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: theme.palette.text.secondary,
              fontSize: '16px',
              fontWeight: theme.typography.fontWeightBold,
              formatter() {
                return ticketData.reduce((sum, item) => sum + item.count, 0).toLocaleString();
              },
            },
            value: {
              fontSize: '22px',
              fontWeight: theme.typography.fontWeightBold,
              color: theme.palette.mode === 'light' ? '#000' : '#fff',
            },
          },
        },
      },
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: {
        colors: theme.palette.mode === 'light' ? '#000' : '#fff',
      },
    },
    tooltip: {
      enabled: true,
      custom: ({
        series,
        seriesIndex,
        w,
      }) => `<div style="background: ${theme.palette.background.paper};
                            padding: 8px;
                            color: ${theme.palette.text.primary};
                            display: flex;
                            align-items: center;
                            gap: 6px">
                  <div style="width: 8px; 
                             height: 8px; 
                             border-radius: 50%; 
                             background: ${ticketData[seriesIndex].color}">
                  </div>
                  ${w.globals.labels[seriesIndex]}: <b>${series[seriesIndex].toLocaleString()}</b>
                </div>`,
    },
  };

  const series = ticketData.map((item) => item.count);

  return (
    <Card sx={{ border: 1, borderColor: theme.palette.divider, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Ticket Distribution
          </Typography>
        </Box>

        <Box sx={{ height: 300 }}>
          <ReactApexChart options={chartOptions} series={series} type="donut" height={300} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketInformation;
