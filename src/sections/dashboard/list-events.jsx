import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import {
  Stack,
  Button,
  Divider,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify/iconify';

// import { usePopover } from 'src/components/custom-popover';

const EventListsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // const popover = usePopover();

  const handleClick = () => {
    router.push('/dashboard/events');
  };

  const fetchEvent = async () => {
    try {
      const response = await axiosInstance.get(endpoints.events.list);
      const eventsArray = response.data;
      setEvents(eventsArray.events.filter((event) => event.status === 'ACTIVE'));
      setStatus('Active');
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [events, status]);

  // Function to format the date in a concise way
  const formatEventDate = (date) => {
    const today = dayjs();
    const eventDate = dayjs(date);
    
    if (eventDate.isSame(today, 'day')) {
      return `Today, ${eventDate.format('h:mm A')}`;
    }
    
    if (eventDate.isSame(today.add(1, 'day'), 'day')) {
      return `Tomorrow, ${eventDate.format('h:mm A')}`;
    }
    
    return eventDate.format('MMM D, YYYY');
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 1,
          border: '0.5px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Active Events
          </Typography>
          
          <Button
            variant="text"
            color="primary"
            onClick={handleClick}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
            sx={{ fontWeight: 500 }}
          >
            View All Events
          </Button>
        </Box>

        <Divider />

        {events.length > 0 ? (
          <Box>
            {events.map((event, index) => (
              <Box
                key={event.id}
                onClick={() => navigate(`${paths.dashboard.events.qr}/${event.id}`)}
                sx={{
                  px: 3,
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: index < events.length - 1 ? '1px dashed' : 'none',
                  borderColor: 'divider',
                  transition: 'background-color 0.15s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    '& .event-name, & .event-date, & .scan-text': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" >
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 'success.main',
                      flexShrink: 0,
                    }} 
                  />
                  
                  <Typography variant="subtitle2" fontWeight={500} className="event-name">
                    {event.name}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    className="event-date"
                    sx={{ 
                      color: 'text.secondary',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <Iconify 
                      icon="eva:clock-outline" 
                      width={14} 
                      sx={{ mr: 0.5, color: 'text.disabled' }} 
                    />
                    {formatEventDate(event.date)}
                  </Typography>
                </Stack>
                
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Iconify 
                    icon="mdi:qrcode-scan" 
                    sx={{ 
                      color: 'text.disabled',
                      width: 14,
                      height: 14,
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    className="scan-text"
                    sx={{ 
                      color: 'text.disabled',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    Click to scan QR
                  </Typography>
                  <Iconify 
                    icon="eva:arrow-ios-forward-fill" 
                    sx={{ 
                      color: 'text.disabled',
                      width: 16,
                      height: 16,
                    }} 
                  />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Box 
            sx={{ 
              py: 4, 
              px: 3, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Iconify 
              icon="eva:calendar-outline" 
              width={40} 
              height={40}
              sx={{ 
                color: 'text.disabled',
                opacity: 0.6,
                mb: 1.5,
              }} 
            />
            
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No active events at the moment
            </Typography>
          </Box>
        )}
      </Card>

      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem>
          <Iconify icon="eva:cloud-download-fill" />
          Download
        </MenuItem>

        <MenuItem>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem>
          <Iconify icon="solar:share-bold" />
          Share
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover> */}
    </>
  );
};

export default EventListsDashboard;
