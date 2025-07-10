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
          right: { xs: -15, sm: -30 },
          color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: -1,
          width: {
            xs: 60,
            sm: 80,
            md: 100
          },
          height: 'auto'
        }}
      />

      <Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            className="hover-text"
            variant="subtitle2"
            color="text.secondary"
            sx={{ 
              fontWeight: 600,
              fontSize: {
                xs: '0.8rem',
                sm: '0.875rem',
                md: '0.875rem'
              }
            }}
          >
            Total Revenue
          </Typography>
        </Stack>
        <Typography 
          variant="h2"
          sx={{
            fontSize: {
              xs: '1.75rem',
              sm: '2rem',
              md: '2.5rem'
            }
          }}
        >
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
