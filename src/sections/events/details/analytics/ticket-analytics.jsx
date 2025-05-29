import React from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Divider, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

const TicketAnalytics = ({ tickets, addOns, eventName }) => {
  const router = useRouter();

  const handleClick = () => {
    // Store the event name in sessionStorage to be retrieved on the ticket types page
    if (eventName) {
      sessionStorage.setItem('ticketTypeEventFilter', JSON.stringify([eventName]));
    }
    router.push(paths.dashboard.ticketType.root);
  };

  const totalTickets = (tickets || 0) + (addOns || 0);

  return (
    <Card
      sx={{
        border: 1,
        borderColor: (theme) => theme.palette.divider,
        borderRadius: 2,
        width: 1,
        // '&:hover': {
        //   cursor: 'pointer',
        //   border: '2px solid',
        //   borderColor: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
        //   '& .hover-text': {
        //     textDecoration: 'underline',
        //     color: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
        //   },
        //   '& .hover-icon': {
        //     color: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
        //   },
        // },
      }}
      // onClick={handleClick}
    >
      <CardContent sx={{ position: 'relative' }}>
        <Iconify
          icon="f7:tickets"
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
              Cumulative Tickets Sold
            </Typography>
            {/* <Iconify className="hover-icon" icon="eva:arrow-ios-forward-fill" /> */}
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
              {totalTickets}
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
                  Tickets
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
                  {tickets || 0}
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
                  Add Ons
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
                  {addOns || 0}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketAnalytics;

TicketAnalytics.propTypes = {
  tickets: PropTypes.number,
  addOns: PropTypes.number,
  eventName: PropTypes.string,
};
