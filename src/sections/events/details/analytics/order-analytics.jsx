import React from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Divider, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

const OrderAnalytics = ({ orders, eventName, eventId }) => {
  const router = useRouter();

  const handleClick = () => {
    // Store the event name in sessionStorage to be retrieved on the orders page
    // if (eventName) {
    //   sessionStorage.setItem('orderEventFilter', eventName);
    // }
    if (eventId) {
      router.push(paths.dashboard.order.event(eventId));
    } else {
      router.push(paths.dashboard.order.root);
    }
  };

  const paidOrders = orders?.filter(order => order.status === 'paid' && Number(order.totalAmount) > 0).length || 0;
  const freeOrders = orders?.filter(order => order.status === 'paid' && Number(order.totalAmount) === 0).length || 0;
  // const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

  return (
    <Card
      sx={{
        border: 1,
        borderColor: (theme) => theme.palette.divider,
        borderRadius: 2,
        width: 1,
        overflow: 'hidden',
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
            right: { xs: -10, sm: -20 },
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

        <Box sx={{ position: 'relative', zIndex: 1 }}>
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
              Completed Orders
            </Typography>
            <Iconify 
              className="hover-icon" 
              icon="eva:arrow-ios-forward-fill"
              sx={{
                width: {
                  xs: 16,
                  sm: 20
                },
                height: 'auto'
              }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
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
              {orders?.length || 0}
            </Typography>

            <Stack 
              direction="row" 
              divider={<Divider orientation="vertical" flexItem />}
              spacing={1.5}
              sx={{ 
                minWidth: 'auto',
                py: { xs: 0.5, sm: 0.75 },
                px: { xs: 1, sm: 1.5 },
                borderRadius: 1,
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(145, 158, 171, 0.12)'
                  : 'rgba(145, 158, 171, 0.08)',
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(145, 158, 171, 0.2)'
                  : 'rgba(145, 158, 171, 0.12)',
              }}
            >
              <Box sx={{ textAlign: 'center', minWidth: { xs: 28, sm: 36 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    fontWeight: 600,
                    mb: 0.25,
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'text.primary',
                    fontSize: {
                      xs: '0.6rem',
                      sm: '0.7rem'
                    }
                  }}
                >
                  Paid
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem'
                    }
                  }}
                >
                  {paidOrders}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: { xs: 28, sm: 36 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    fontWeight: 600,
                    mb: 0.25,
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'text.primary',
                    fontSize: {
                      xs: '0.6rem',
                      sm: '0.7rem'
                    }
                  }}
                >
                  Free
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem'
                    }
                  }}
                >
                  {freeOrders}
                </Typography>
              </Box>
              {/* <Box sx={{ textAlign: 'center', minWidth: 36 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    fontWeight: 600,
                    mb: 0.25,
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'text.primary',
                    fontSize: '0.7rem',
                  }}
                >
                  Pending
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{pendingOrders}</Typography>
              </Box> */}
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
