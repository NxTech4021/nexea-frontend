import React from 'react';
import PropTypes from 'prop-types';

import { Card, Typography, CardContent } from '@mui/material';

import Iconify from 'src/components/iconify';

const CheckInAnalytics = ({ checkedIns }) => (
  <Card
    sx={{ border: 1, borderColor: (theme) => theme.palette.divider, borderRadius: 2, width: 1 }}
  >
    {/* <CardHeader
      title="Total Checked In"
      titleTypographyProps={{
        variant: 'subtitle2',
        color: 'text.secondary',
      }}
      sx={{ py: 1.5 }}
    /> */}

    <CardContent sx={{ position: 'relative' }}>
      <Iconify
        icon="iconamoon:check-circle-1-thin"
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
        Total Checked In
      </Typography>
      <Typography variant="h2">{checkedIns?.length || 0}</Typography>
    </CardContent>
  </Card>
);

export default CheckInAnalytics;

CheckInAnalytics.propTypes = {
  checkedIns: PropTypes.array,
};
