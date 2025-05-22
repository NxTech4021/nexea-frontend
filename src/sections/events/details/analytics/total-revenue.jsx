import React from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Typography, CardContent } from '@mui/material';

import Iconify from 'src/components/iconify';

const TotalRevenue = ({ totalRevenue }) => (
  <Card
    sx={{
      border: 1,
      borderColor: (theme) => theme.palette.divider,
      borderRadius: 2,
      width: 1,
    }}
  >
    <CardContent sx={{ position: 'relative' }}>
      <Iconify
        icon="tdesign:money"
        width={100}
        sx={{
          position: 'absolute',
          right: -30,
          color: '#EBEBEB',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      <Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            className="hover-text"
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Total Revenue
          </Typography>
        </Stack>
        <Typography variant="h2">
          {new Intl.NumberFormat('en-MY', {
            minimumFractionDigits: 2,
            style: 'currency',
            currency: 'MYR',
          }).format(totalRevenue || 0)}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default TotalRevenue;

TotalRevenue.propTypes = {
  totalRevenue: PropTypes.number,
};
