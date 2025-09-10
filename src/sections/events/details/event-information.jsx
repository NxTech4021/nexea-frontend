import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
// import { Form, Field, Formik, ErrorMessage } from 'formik';

// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
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
  Button,
  Divider,
  Tooltip,
  // MenuItem,
  // TextField,
  keyframes,
  IconButton,
  Typography,
  // InputLabel,
  CardContent,
  // DialogTitle,
  // FormControl,
  // DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

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
  const router = useRouter();
  const theme = useTheme();

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
  const isDefaultTime = (date) => dayjs(date).format('HH:mm') === '00:00';

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: 3,
        width: 1,
        marginTop: 1.5,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Divider />
      <CardContent>
        <Box display="flex" justifyContent="space-between" sx={{ p: 0.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Tooltip title="Back to Events">
              <IconButton
                onClick={() => router.push(paths.dashboard.events.root)}
                sx={{
                  width: { xs: 36, sm: 40, md: 42 },
                  height: { xs: 36, sm: 40, md: 42 },
                  color: 'common.white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 1,
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'common.white',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                }}
              >
                <Iconify icon="eva:arrow-back-fill" width={{ xs: 18, sm: 20, md: 22 }} height={{ xs: 18, sm: 20, md: 22 }} />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                width: { xs: 40, sm: 60, md: 80, lg: 90 },
                height: { xs: 40, sm: 60, md: 80, lg: 90 },
                borderRadius: 1.5,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: event.eventSetting?.bgColor || 'background.neutral',
              }}
            >
              <Avatar
                alt={event.name}
                src={event.eventSetting?.eventLogo || "/logo/nexea.png"}
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: event.eventSetting?.bgColor || 'background.neutral',
                  '& img': {
                    objectFit: 'contain',
                    width: '90%',
                    height: '90%',
                    margin: 'auto',
                  },
                }}
              />
            </Box>
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              {/* Desktop layout - Event name and status */}
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontSize: { xs: '1rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' },
                display: { xs: 'none', sm: 'none', md: 'flex' },
                alignItems: 'center',
                flexDirection: 'row',
                gap: 1
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
                    px: { sm: 0.75, md: 1, lg: 1.25 },
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: { sm: 11, md: 12, lg: 13 },
                    fontWeight: 600,
                    color: getStatusConfig(event.status).color,
                    bgcolor: getStatusConfig(event.status).bgColor,
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
                      bgcolor: getStatusConfig(event.status).color,
                    }}
                  />
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Box>
              </Typography>

              {/* Mobile layout - Event name and status */}
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontSize: '0.9rem',
                display: { xs: 'flex', sm: 'none' },
                alignItems: 'center',
                gap: 1
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
                    fontSize: 10,
                    fontWeight: 600,
                    color: getStatusConfig(event.status).color,
                    bgcolor: getStatusConfig(event.status).bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: getStatusConfig(event.status).color,
                    }}
                  />
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Box>
              </Typography>

              {/* Desktop layout - Date/Time/POI info */}
              <Stack spacing={0.5} sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="eva:calendar-outline" sx={{ color: 'white', width: { sm: 12, md: 14, lg: 16 }, height: { sm: 12, md: 14, lg: 16 } }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: 'white', 
                    fontWeight: 'normal', 
                    fontSize: { sm: '0.75rem', md: '0.85rem', lg: '0.9rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {dayjs(event.date).format('LL')} - {dayjs(event.endDate).format('LL')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="eva:clock-outline" sx={{ color: 'white', width: { sm: 12, md: 14, lg: 16 }, height: { sm: 12, md: 14, lg: 16 } }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: 'white', 
                    fontWeight: 'normal', 
                    fontSize: { sm: '0.75rem', md: '0.85rem', lg: '0.9rem' }
                  }}>
                    {dayjs(event.date).format('hh:mm A')} - {dayjs(event.endDate).format('hh:mm A')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="eva:person-outline" sx={{ color: 'white', width: { sm: 12, md: 14, lg: 16 }, height: { sm: 12, md: 14, lg: 16 } }} />
                  <Typography variant="subtitle2" sx={{ 
                    color: 'white', 
                    fontWeight: 'normal', 
                    fontSize: { sm: '0.75rem', md: '0.85rem', lg: '0.9rem' },
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
          
          {/* Right side content - Desktop only */}
          <Stack alignItems="flex-end" justifyContent="center" spacing={1.5} sx={{ 
            minWidth: 'fit-content',
            ml: { sm: 1, md: 2, lg: 3 },
            display: { xs: 'none', sm: 'none', md: 'flex' }
          }}>
            {/* Countdown */}
            {countdown && (
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: { sm: '0.8rem', md: '0.9rem', lg: '1rem' },
                  letterSpacing: 0.5,
                  fontFamily: '"Roboto Mono", monospace',
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'right',
                }}
              >
                <Iconify icon="eva:clock-outline" width={{ sm: 12, md: 14, lg: 16 }} height={{ sm: 12, md: 14, lg: 16 }} sx={{ opacity: 1, mr: 0.5 }} />
                {countdown}
              </Typography>
            )}

            {/* Action Buttons */}
            <Stack 
              direction="row"
              spacing={{ sm: 0.5, md: 0.75, lg: 1 }}
              sx={{ 
                alignItems: 'flex-end',
                width: 'fit-content',
                flexWrap: { sm: 'wrap', md: 'nowrap' }
              }}
            >
              <Button
                variant="contained"
                onClick={() => router.push(`${paths.dashboard.events.qr}/${event.id}`)}
                sx={{
                  height: { sm: '32px', md: '34px', lg: '36px' },
                  px: { sm: 1.5, md: 2, lg: 2.5 },
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'common.white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                  fontWeight: 500,
                  fontSize: { sm: '0.7rem', md: '0.75rem', lg: '0.8rem' },
                  textTransform: 'none',
                  minWidth: 'auto',
                }}
              >
                <Iconify icon="bx:qr" width={{ sm: 14, md: 16, lg: 18 }} height={{ sm: 14, md: 16, lg: 18 }} />
                Check In
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  const eventLink = `${import.meta.env.VITE_BASE_URL}/event/${event.id}`;
                  navigator.clipboard
                    .writeText(eventLink)
                    .then(() => {
                      enqueueSnackbar('Cart link copied!', { variant: 'success' });
                    })
                    .catch((error) => {
                      console.error('Error copying link: ', error);
                      enqueueSnackbar('Failed to copy link', { variant: 'error' });
                    });
                }}
                sx={{
                  height: { sm: '32px', md: '34px', lg: '36px' },
                  px: { sm: 1.5, md: 2, lg: 2.5 },
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'common.white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                  fontWeight: 500,
                  fontSize: { sm: '0.7rem', md: '0.75rem', lg: '0.8rem' },
                  textTransform: 'none',
                  minWidth: 'auto',
                }}
              >
                <Iconify icon="eva:copy-outline" width={{ sm: 14, md: 16, lg: 18 }} height={{ sm: 14, md: 16, lg: 18 }} />
                Cart Link
              </Button>

              <Button
                variant="contained"
                onClick={() => router.push(`${paths.dashboard.events.attendees}/${event.id}`)}
                sx={{
                  height: { sm: '32px', md: '34px', lg: '36px' },
                  px: { sm: 1.5, md: 2, lg: 2.5 },
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'common.white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                  fontWeight: 500,
                  fontSize: { sm: '0.7rem', md: '0.75rem', lg: '0.8rem' },
                  textTransform: 'none',
                  minWidth: 'auto',
                }}
              >
                <Iconify icon="mdi:account-group" width={{ sm: 14, md: 16, lg: 18 }} height={{ sm: 14, md: 16, lg: 18 }} />
                List
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  setSelectedEvent(event);
                  setOpenEdit(true);
                }}
                sx={{
                  height: { sm: '32px', md: '34px', lg: '36px' },
                  px: { sm: 1.5, md: 2, lg: 2.5 },
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'common.white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                  fontWeight: 500,
                  fontSize: { sm: '0.7rem', md: '0.75rem', lg: '0.8rem' },
                  textTransform: 'none',
                  minWidth: 'auto',
                }}
              >
                <Iconify icon="eva:edit-fill" width={{ sm: 14, md: 16, lg: 18 }} height={{ sm: 14, md: 16, lg: 18 }} />
                Edit
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Medium Screen Layout - Tablet optimized */}
        <Box sx={{ display: { xs: 'none', sm: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5, mt: 2, px: 1 }}>
          {/* Event name and status for medium screens */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontSize: '1.1rem',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {items[0].content}
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: 12,
                fontWeight: 600,
                color: getStatusConfig(event.status).color,
                bgcolor: getStatusConfig(event.status).bgColor,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
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
          </Box>

          {/* Event details for medium screens */}
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:calendar-outline" sx={{ color: 'white', width: 16, height: 16 }} />
              <Typography variant="subtitle2" sx={{ 
                color: 'white', 
                fontWeight: 'normal', 
                fontSize: '0.9rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {dayjs(event.date).format('LL')} - {dayjs(event.endDate).format('LL')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:clock-outline" sx={{ color: 'white', width: 16, height: 16 }} />
              <Typography variant="subtitle2" sx={{ 
                color: 'white', 
                fontWeight: 'normal', 
                fontSize: '0.9rem'
              }}>
                {dayjs(event.date).format('hh:mm A')} - {dayjs(event.endDate).format('hh:mm A')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:person-outline" sx={{ color: 'white', width: 16, height: 16 }} />
              <Typography variant="subtitle2" sx={{ 
                color: 'white', 
                fontWeight: 'normal', 
                fontSize: '0.9rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {items[3].content}
              </Typography>
            </Box>
          </Stack>

          {/* Countdown for medium screens */}
          {countdown && (
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 500,
                fontSize: '0.9rem',
                letterSpacing: 0.5,
                fontFamily: '"Roboto Mono", monospace',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Iconify icon="eva:clock-outline" width={16} height={16} sx={{ opacity: 1, mr: 0.5 }} />
              {countdown}
            </Typography>
          )}

          {/* Action buttons for medium screens */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => router.push(`${paths.dashboard.events.qr}/${event.id}`)}
              sx={{
                height: '36px',
                px: 2,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
                flex: '1 1 auto',
                minWidth: '120px',
              }}
            >
              <Iconify icon="bx:qr" width={16} height={16} />
              Check In
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                const eventLink = `${import.meta.env.VITE_BASE_URL}/event/${event.id}`;
                navigator.clipboard
                  .writeText(eventLink)
                  .then(() => {
                    enqueueSnackbar('Cart link copied!', { variant: 'success' });
                  })
                  .catch((error) => {
                    console.error('Error copying link: ', error);
                    enqueueSnackbar('Failed to copy link', { variant: 'error' });
                  });
              }}
              sx={{
                height: '36px',
                px: 2,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
                flex: '1 1 auto',
                minWidth: '120px',
              }}
            >
              <Iconify icon="eva:copy-outline" width={16} height={16} />
              Cart Link
            </Button>

            <Button
              variant="contained"
              onClick={() => router.push(`${paths.dashboard.events.attendees}/${event.id}`)}
              sx={{
                height: '36px',
                px: 2,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
                flex: '1 1 auto',
                minWidth: '120px',
              }}
            >
              <Iconify icon="mdi:account-group" width={16} height={16} />
              Attendee List
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                setSelectedEvent(event);
                setOpenEdit(true);
              }}
              sx={{
                height: '36px',
                px: 2,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
                flex: '1 1 auto',
                minWidth: '120px',
              }}
            >
              <Iconify icon="eva:edit-fill" width={16} height={16} />
              Edit Event
            </Button>
          </Stack>
        </Box>

        {/* Mobile Layout - Stacked Information */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1, mt: 1, px: { xs: 0.5, sm: 0 } }}>
          {/* Countdown */}
          {countdown && (
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 500,
                fontSize: '0.8rem',
                letterSpacing: 0.5,
                fontFamily: '"Roboto Mono", monospace',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Iconify icon="eva:clock-outline" width={12} height={12} sx={{ opacity: 1, mr: 0.5 }} />
              {countdown}
            </Typography>
          )}

          {/* Date and Time */}
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Iconify icon="eva:calendar-outline" sx={{ color: 'white', width: 12, height: 12 }} />
              <Typography variant="subtitle2" sx={{ 
                color: 'white', 
                fontWeight: 'normal', 
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {dayjs(event.date).format('LL')} - {dayjs(event.endDate).format('LL')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Iconify icon="eva:clock-outline" sx={{ color: 'white', width: 12, height: 12 }} />
              <Typography variant="subtitle2" sx={{ 
                color: 'white', 
                fontWeight: 'normal', 
                fontSize: '0.75rem'
              }}>
                {dayjs(event.date).format('hh:mm A')} - {dayjs(event.endDate).format('hh:mm A')}
              </Typography>
            </Box>
          </Stack>

          {/* Person in Charge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Iconify icon="eva:person-outline" sx={{ color: 'white', width: 12, height: 12 }} />
            <Typography variant="subtitle2" sx={{ 
              color: 'white', 
              fontWeight: 'normal', 
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {items[3].content}
            </Typography>
          </Box>

          {/* Mobile Action Buttons */}
          <Stack spacing={0.75} sx={{ mt: 1, px: 1 }}>
            <Button
              variant="contained"
              onClick={() => router.push(`${paths.dashboard.events.qr}/${event.id}`)}
              sx={{
                height: '36px',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
              }}
            >
              <Iconify icon="bx:qr" width={16} height={16} />
              Check In
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                const eventLink = `${import.meta.env.VITE_BASE_URL}/event/${event.id}`;
                navigator.clipboard
                  .writeText(eventLink)
                  .then(() => {
                    enqueueSnackbar('Cart link copied!', { variant: 'success' });
                  })
                  .catch((error) => {
                    console.error('Error copying link: ', error);
                    enqueueSnackbar('Failed to copy link', { variant: 'error' });
                  });
              }}
              sx={{
                height: '36px',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
              }}
            >
              <Iconify icon="eva:copy-outline" width={16} height={16} />
              Cart Link
            </Button>

            <Button
              variant="contained"
              onClick={() => router.push(`${paths.dashboard.events.attendees}/${event.id}`)}
              sx={{
                height: '36px',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
              }}
            >
              <Iconify icon="mdi:account-group" width={16} height={16} />
              Attendee List
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                setSelectedEvent(event);
                setOpenEdit(true);
              }}
              sx={{
                height: '36px',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
                fontWeight: 500,
                fontSize: '0.8rem',
                textTransform: 'none',
              }}
            >
              <Iconify icon="eva:edit-fill" width={16} height={16} />
              Edit Event
            </Button>
          </Stack>
        </Box>
      </CardContent>
      <EditEventModal
        open={openEdit}
        onClose={handleCloseEdit}
        selectedEvent={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />
    </Card>
  );
};

export default EventInformation;

EventInformation.propTypes = {
  event: PropTypes.object,
};
