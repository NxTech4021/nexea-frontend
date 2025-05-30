import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Avatar, Typography } from '@mui/material';

import { useGetAllEvents } from 'src/api/event';

// ----------------------------------------------------------------------

export default function EventCountdown() {
  const { data, isLoading } = useGetAllEvents();
  const [nextEvent, setNextEvent] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (data?.events) {
      const now = dayjs();
      
      // Filter upcoming events (both ACTIVE and INACTIVE)
      const upcomingEvents = data.events.filter((event) => {
        const eventDate = dayjs(event.date);
        const isUpcoming = eventDate.isAfter(now);  
        // console.log('Event:', event.name, 'Date:', eventDate.format(), 'Is Upcoming:', isUpcoming, 'Status:', event.status);
        return isUpcoming;
      });
      
    //   console.log('Upcoming events:', upcomingEvents);
      
      if (upcomingEvents.length > 0) {
        // Sort by date and get the closest one
        const closest = upcomingEvents.sort((a, b) => 
          dayjs(a.date).diff(dayjs(b.date))
        )[0];
        // console.log('Next event selected:', closest);
        setNextEvent(closest);
      } else {
        // console.log('No upcoming events found');
      }
    }
  }, [data]);

  useEffect(() => {
    if (!nextEvent) return;

    const updateCountdown = () => {
      const now = dayjs();
      const eventDate = dayjs(nextEvent.date);
      const diff = eventDate.diff(now, 'second');

      if (diff > 0) {
        const days = Math.floor(diff / (24 * 60 * 60));
        const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((diff % (60 * 60)) / 60);
        const seconds = diff % 60;
        setCountdown(`${days}D : ${hours}H : ${minutes}M : ${seconds}S`);
      } else {
        setCountdown('Event Started');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    // eslint-disable-next-line consistent-return
    return () => clearInterval(interval);
  }, [nextEvent]);

  if (isLoading) {
    return (
      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.neutral' }}>
        <Stack spacing={2}>
          <Box sx={{ width: '60%', height: 24, bgcolor: 'background.paper', borderRadius: 0.5 }} />
          <Box sx={{ width: '40%', height: 24, bgcolor: 'background.paper', borderRadius: 0.5 }} />
        </Stack>
      </Box>
    );
  }

  if (!nextEvent) return null;

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 2.5 },
      borderRadius: 2,
      bgcolor: (theme) => alpha(theme.palette.background.neutral, theme.palette.mode === 'light' ? 0.4 : 0.2),
      border: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'light' ? 'divider' : 'background.neutral',
      transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
    }}>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          minWidth: 0,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Avatar
            alt={nextEvent.name}
            src={nextEvent.eventSetting?.eventLogo || "/logo/nexea.png"}
            sx={{
              width: { xs: 28, sm: 38 },
              height: { xs: 28, sm: 38 },
              borderRadius: 1.5,
              bgcolor: nextEvent.eventSetting?.bgColor || 'background.neutral',
              '& img': {
                objectFit: 'contain',
                width: '70%',
                height: '70%',
                margin: 'auto',
              },
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              noWrap 
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                transition: (theme) => theme.transitions.create('color'),
              }}
            >
              {nextEvent.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                display: 'block',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                transition: (theme) => theme.transitions.create('color'),
              }}
            >
              {dayjs(nextEvent.date).format('MMM D, YYYY • h:mm A')}
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: (theme) => alpha(
              theme.palette.background.neutral, 
              theme.palette.mode === 'light' ? 0.8 : 0.3
            ),
            py: { xs: 0.25, sm: 0.5 },
            px: { xs: 0.75, sm: 1 },
            borderRadius: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Typography 
            sx={{ 
              color: 'text.primary',
              fontSize: { xs: '0.7rem', sm: '0.9rem' },
              fontFamily: 'monospace',
              fontWeight: 600,
              opacity: 0.8,
              transition: (theme) => theme.transitions.create('color'),
            }}
          >
          {countdown}  
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

EventCountdown.propTypes = {
  // no props at the moment
};
