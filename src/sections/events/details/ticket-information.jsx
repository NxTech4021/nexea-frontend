import React from 'react';
import ReactApexChart from 'react-apexcharts';

import { Box, Card, useTheme, Typography, CardContent } from '@mui/material';
import PropTypes from 'prop-types';

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

const colors = [
  '#DAF7A6',
  '#FFC300',
  '#FF5733',
  '#C70039',
  '#900C3F',
  '#581845',
  '#1e8449',
  '#5b2c6f',
  '#922b21',
  '#873600',
];

const TicketInformation = ({ tickets }) => {
  const theme = useTheme();

  const chartOptions = {
    chart: {
      type: 'donut',
    },
    labels: tickets?.filter((a) => a?.sold > 0).map((item) => item.title),
    colors: tickets?.map((_, index) => colors[index]),
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Sold',
              color: theme.palette.text.secondary,
              fontSize: '16px',
              fontWeight: theme.typography.fontWeightBold,
              formatter() {
                return tickets.reduce((sum, item) => sum + item.sold, 0).toLocaleString();
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
                             background: ${colors[seriesIndex]}">
                  </div>
                  ${w.globals.labels[seriesIndex]}: <b>${series[seriesIndex].toLocaleString()}</b>
                </div>`,
    },
  };

  const series = tickets?.filter((a) => a?.sold > 0)?.map((item) => item?.sold || 0);

  console.log(tickets);

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

TicketInformation.propTypes = {
  tickets: PropTypes.array,
};
