import React from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Tooltip, Typography, IconButton, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

const TicketAnalytics = ({ tickets, eventName }) => {
  const router = useRouter();

  const handleClick = () => {
    // Store the event name in sessionStorage to be retrieved on the ticket types page
    if (eventName) {
      sessionStorage.setItem('ticketTypeEventFilter', JSON.stringify([eventName]));
    }
    router.push(paths.dashboard.ticketType.root);
  };

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
              Cumulative Tickets Sold
            </Typography>
            <Iconify className="hover-icon" icon="eva:arrow-ios-forward-fill" />
          </Stack>

          <Stack alignItems="start" direction="row" spacing={1}>
            <Typography variant="h2">{tickets || 0}</Typography>
            <Tooltip title="Including Add On Tickets">
              <IconButton>
                <Iconify icon="material-symbols:info-outline-rounded" width={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketAnalytics;

TicketAnalytics.propTypes = {
  tickets: PropTypes.array,
  eventName: PropTypes.string,
};
