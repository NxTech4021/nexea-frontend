import React from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';

import { Card } from '@mui/material';

const AttendeeAnalytics = ({ groupedAttendees }) => {
  const chartOptions = {
    chart: {
      type: 'line',
      zoom: { enabled: false },
    },
    xaxis: {
      categories: groupedAttendees.map((item) => item.date),
      title: { text: 'Date' },
      labels: { rotate: -45 },
    },
    yaxis: {
      title: { text: 'Count' },
    },
    stroke: {
      curve: 'smooth',
    },
    markers: {
      size: 5,
    },
    title: {
      text: 'Attendees count by date',
      align: 'center',
    },
  };

  const series = [
    {
      name: 'Count',
      data: groupedAttendees.map((item) => item.count),
    },
  ];

  return (
    <Card
      sx={{
        border: 1,
        borderColor: (theme) => theme.palette.divider,
        borderRadius: 2,
        width: 1,
        p: 2,
      }}
    >
      <ReactApexChart options={chartOptions} series={series} type="line" height={350} />
    </Card>
  );
};

export default AttendeeAnalytics;

AttendeeAnalytics.propTypes = {
  groupedAttendees: PropTypes.object,
};
