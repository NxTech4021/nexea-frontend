import React from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

const OrderAnalytics = ({ orders }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(paths.dashboard.order.root);
  };

  return (
    <Card
      sx={{
        border: 1,
        borderColor: (theme) => theme.palette.divider,
        borderRadius: 2,
        width: 1,
        '&:hover': {
          cursor: 'pointer',
          border: '2px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
          '& .hover-text': {
            textDecoration: 'underline',
            color: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
          },
          '& .hover-icon': {
            color: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
          },
        },
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ position: 'relative' }}>
        <Iconify
          icon="lets-icons:order"
          width={100}
          sx={{
            position: 'absolute',
            right: -30,
            color: '#EBEBEB',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />

        <Box sx={{ cursor: 'pointer' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              className="hover-text"
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Total Orders
            </Typography>
            <Iconify className="hover-icon" icon="eva:arrow-ios-forward-fill" />
          </Stack>
          <Typography variant="h2">{orders?.length || 0}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderAnalytics;

OrderAnalytics.propTypes = {
  orders: PropTypes.array,
};
