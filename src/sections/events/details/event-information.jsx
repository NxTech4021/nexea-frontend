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
  Chip,
  // Grid,
  Stack,
  // Dialog,
  // Avatar,
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
        color: '#229A16',
        bgColor: '#E9FCD4',
        icon: 'eva:checkmark-circle-2-fill',
      };
    case 'INACTIVE':
      return {
        color: '#B72136',
        bgColor: '#FFE7D9',
        icon: 'ic:outline-block',
      };
    default:
      return {
        color: '#637381',
        bgColor: '#F4F6F8',
        icon: 'mdi:help-circle',
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
  const [eventStatus, setEventStatus] = useState('');
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
        setEventStatus('');
      } else {
        setCountdown('');
        setEventStatus('Event has ended.');
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
          <Box>
            <img
              src="/assets/nexea.png"
              alt="Nexea Logo"
              style={{ width: '80px', marginBottom: '4px' }}
            />
            <Typography variant="h6" sx={{ color: 'white', mb: 1, fontSize: '1.1rem' }}>
              {items[0].content}
            </Typography>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Iconify icon="eva:calendar-outline" sx={{ color: 'white', width: 14, height: 14 }} />
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'normal', fontSize: '0.85rem' }}>
                  {dayjs(event.date).format('LL')} - {dayjs(event.endDate).format('LL')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Iconify icon="eva:clock-outline" sx={{ color: 'white', width: 14, height: 14 }} />
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'normal', fontSize: '0.85rem' }}>
                  {dayjs(event.date).format('hh:mm A')} - {dayjs(event.endDate).format('hh:mm A')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Iconify icon="eva:person-outline" sx={{ color: 'white', width: 14, height: 14 }} />
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'normal', fontSize: '0.85rem' }}>
                  {items[3].content}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Stack alignItems="center" justifyContent="center" spacing={0.75}>
            <Chip
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
            />
            {eventStatus ? (
              <Typography
                variant="subtitle2"
                sx={{ color: 'red', fontWeight: 'bold', marginTop: 1 }}
              >
                {eventStatus}
              </Typography>
            ) : (
              <Typography
                variant="h6"
                sx={{ color: 'white', fontWeight: 'bold', marginTop: 1, fontFamily: 'monospace' }}
              >
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
