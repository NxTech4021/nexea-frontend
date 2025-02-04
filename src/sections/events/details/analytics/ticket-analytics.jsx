import React from 'react';
import PropTypes from 'prop-types';

import { Card, Typography, CardContent } from '@mui/material';

import Iconify from 'src/components/iconify';

const TicketAnalytics = ({ tickets }) => (
  <Card
    sx={{ border: 1, borderColor: (theme) => theme.palette.divider, borderRadius: 2, width: 1 }}
  >
    <CardContent sx={{ position: 'relative' }}>
      <Iconify
        icon="f7:tickets"
        width={100}
        sx={{
          position: 'absolute',
          right: -30,
          color: '#EBEBEB',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      <Typography variant="subtitle2" color="text.secondary">
        Total Tickets
      </Typography>
      <Typography variant="h2">{tickets?.length || 0}</Typography>
    </CardContent>
  </Card>
);

export default TicketAnalytics;

TicketAnalytics.propTypes = {
  tickets: PropTypes.array,
};
