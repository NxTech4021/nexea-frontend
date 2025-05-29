import dayjs from 'dayjs';
import PropTypes from 'prop-types';
// import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
// import { Form, Field, Formik, ErrorMessage } from 'formik';

// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Card,
  // Chip,
  // Grid,
  Stack,
  // Dialog,
  alpha,
  Avatar,
  // Select,
  // Button,
  Divider,
  // MenuItem,
  // TextField,
  keyframes,
  Typography,
  // InputLabel,
  CardContent,
  // DialogTitle,
  // FormControl,
  // DialogContent,
} from '@mui/material';

// import { endpoints, axiosInstance } from 'src/utils/axios';
import { useGetAllEvents } from 'src/api/event';

import Iconify from 'src/components/iconify';

import EditEventModal from '../create/dialog/edit-event-modal';

const EventStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'ACTIVE':
      return {
        color: '#36B37E',
        bgColor: alpha('#36B37E', 0.1),
        icon: 'eva:radio-button-on-outline',
      };
    case 'INACTIVE':
      return {
        color: '#FF5630',
        bgColor: alpha('#FF5630', 0.1),
        icon: 'eva:radio-button-off-outline',
      };
    default:
      return {
        color: '#637381',
        bgColor: alpha('#637381', 0.1),
        icon: 'eva:question-mark-circle-outline',
      };
  }
};

const borderAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const EventInformation = ({ event }) => {
  const [countdown, setCountdown] = useState('');
  // const [eventStatus, setEventStatus] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { mutate } = useGetAllEvents(event.id);

  useEffect(() => {
    const calculateCountdown = () => {
      const eventDate = new Date(event.date);
      const now = new Date();
      const difference = eventDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown(`${days}D : ${hours}H : ${minutes}M : ${seconds}S`);
        // setEventStatus('');
      } else {
        setCountdown('');
        // setEventStatus('Event Ended');
      }
    };

    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  const items = [
    { title: 'Name', content: event.name },
    { title: 'Event Date', content: dayjs(event.date).format('LL') },
    { title: 'Event Time', content: dayjs(event.date).format('hh:mm A') },
    { title: 'Person In charge', content: event.personInCharge.fullName },
    { title: 'Status', content: event.status },
  ];

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };
  const handleEventUpdated = (updatedEvent) => {
    // This will refresh the data using your SWR hook
    mutate();
  };
  const isDefaultTime = (date) => {
  return dayjs(date).format('HH:mm') === '00:00';
};
  return (
    <Card
      sx={{
        background: 'linear-gradient(to right, rgba(0, 0, 0, 1), rgba(226, 228, 230, 0.2) 400%)',
        borderRadius: 2,
        width: 1,
        marginTop: 1.5,
        position: 'relative',
        overflow: 'hidden',
        '::before': {
          content: '""',
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          borderRadius: '18px',
          padding: '2px',
          background: 'linear-gradient(to right, #200122, #6f0000, #200122)',
          backgroundSize: '200% auto',
          backgroundRepeat: 'repeat',
          animation: `${borderAnimation} 7s linear infinite`,
          zIndex: -1,
        },
      }}
    >
      <Box
        onClick={() => {
          setSelectedEvent(event);
          setOpenEdit(true);
        }}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: {
            xs: '25%',
            sm: '15%',
            md: '8%',
          },
          height: '36px',
          backgroundColor: 'white',
          display: 'flex',
          gap: 0.5,
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomLeftRadius: 16,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        <Iconify
          icon="eva:edit-fill"
          width={14}
          height={14}
          sx={{
            color: 'grey.800',
            display: { xs: 'block', sm: 'block' },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'grey.800',
            fontWeight: 550,
            fontSize: {
              xs: '0.7rem',
              sm: '0.75rem',
              md: '0.8rem',
            },
          }}
        >
          Edit
        </Typography>
      </Box>
      <Divider />
      <CardContent>
        <Box display="flex" justifyContent="space-between" sx={{ p: 0.5 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                borderRadius: 1.5,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'background.neutral',
              }}
            >
              <Avatar
                alt={event.name}
                src={event.eventSetting?.eventLogo || "/logo/nexea.png"}
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'background.neutral',
                  '& img': {
                    objectFit: 'contain',
                    width: '70%',
                    height: '70%',
                    margin: 'auto',
                  },
                }}
              />
            </Box>
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 1 }
              }}>
                <Box sx={{ 
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {items[0].content}
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 600,
                    color: getStatusConfig(event.status).color,
                    bgcolor: getStatusConfig(event.status).bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: getStatusConfig(event.status).color,
                    }}
                  />
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Box>
              </Typography>

              <Stack spacing={0.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="eva:calendar-outline" sx={{ color: 'white', width: { xs: 12, sm: 14 }, height: { xs: 12, sm: 14 } }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: 'white', 
                    fontWeight: 'normal', 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {dayjs(event.date).format('LL')} - {dayjs(event.endDate).format('LL')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="eva:clock-outline" sx={{ color: 'white', width: { xs: 12, sm: 14 }, height: { xs: 12, sm: 14 } }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: 'white', 
                    fontWeight: 'normal', 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' }
                  }}>
                    {dayjs(event.date).format('hh:mm A')} - {dayjs(event.endDate).format('hh:mm A')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="eva:person-outline" sx={{ color: 'white', width: { xs: 12, sm: 14 }, height: { xs: 12, sm: 14 } }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: 'white', 
                    fontWeight: 'normal', 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {items[3].content}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
          <Stack alignItems="center" justifyContent="center" spacing={0.75} sx={{ mt: { xs: 2, sm: 0 } }}>
            {/* <Chip
              icon={<Iconify icon={getStatusConfig(event.status).icon} width={16} height={16} />}
              label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              sx={{
                backgroundColor: getStatusConfig(event.status).bgColor,
                color: getStatusConfig(event.status).color,
                borderRadius: 2,
                height: 25,
                paddingX: 2,
                justifyContent: 'center',
                '& .MuiChip-icon': { color: getStatusConfig(event.status).color },
                '&:hover': {
                  backgroundColor: getStatusConfig(event.status).bgColor,
                },
              }}
            /> */}

            {/* {eventStatus ? (
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: { xs: 11, sm: 12 },
                  fontWeight: 600,
                  color: '#FF5630',
                  bgcolor: alpha('#FF5630', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#FF5630',
                  }}
                />
                {eventStatus}
              </Box>
            ) : ( */}

            {countdown && (
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                  letterSpacing: 0.5,
                  fontFamily: '"Roboto Mono", monospace',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Iconify icon="eva:clock-outline" width={16} height={16} sx={{ opacity: 1, mr: 1 }} />
                {countdown}
              </Typography>
            )}
          </Stack>
        </Box>
      </CardContent>
      <>{/* called ticket eventmodel in  Edit Information Modal */}</>
      <EditEventModal
        open={openEdit}
        onClose={handleCloseEdit}
        selectedEvent={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />{' '}
    </Card>
  );
};

export default EventInformation;

EventInformation.propTypes = {
  event: PropTypes.object,
};
