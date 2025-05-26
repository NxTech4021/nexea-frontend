import React from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

const OrderAnalytics = ({ orders, eventName, eventId }) => {
  const router = useRouter();

  const handleClick = () => {
    // Store the event name in sessionStorage to be retrieved on the orders page
    if (eventName) {
      sessionStorage.setItem('orderEventFilter', eventName);
    }
    if (eventId) {
      router.push(paths.dashboard.order.event(eventId));
    } else {
      router.push(paths.dashboard.order.root);
    }
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

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                className="hover-text"
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Completed Orders
              </Typography>
              <Iconify className="hover-icon" icon="eva:arrow-ios-forward-fill" />
            </Stack>
            <Typography variant="h2">{orders?.length || 0}</Typography>
          </Box>
          {/* Breakdown section */}
          <Stack direction="column" spacing={1} sx={{ minWidth: 130, ml: 2 }}>
            {/* Paid */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon="eva:checkmark-circle-2-fill"
                width={18}
                sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111' }}
              />
              <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111', fontWeight: 500 }}>
                Paid: {orders?.filter(order => order.status === 'paid' && Number(order.totalAmount) > 0).length || 0}
              </Typography>
            </Stack>
            {/* Free */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon="eva:pricetags-outline"
                width={18}
                sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111' }}
              />
              <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111', fontWeight: 500 }}>
                Free: {orders?.filter(order => order.status === 'paid' && Number(order.totalAmount) === 0).length || 0}
              </Typography>
            </Stack>
            {/* Pending */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon="eva:clock-fill"
                width={18}
                sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111' }}
              />
              <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111', fontWeight: 500 }}>
                Pending: {orders?.filter(order => order.status === 'pending').length || 0}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderAnalytics;

OrderAnalytics.propTypes = {
  orders: PropTypes.array,
  eventName: PropTypes.string,
  eventId: PropTypes.string,
};
