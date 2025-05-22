/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/no-unresolved */

import dayjs from 'dayjs';

import 'react-toastify/dist/ReactToastify.css';

import React, { useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import {
  Box,
  Grid,
  Menu,
  Chip,
  Card,
  Stack,
  Button,
  Dialog,
  Avatar,
  Divider,
  Tooltip,
  MenuItem,
  Skeleton,
  Collapse,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  CardContent,
  ListItemIcon,
  DialogContent,
  DialogActions,
  useMediaQuery,
  CardActionArea,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import { endpoints, axiosInstance } from 'src/utils/axios';

import useSWR from 'swr';

import { useNavigate } from 'react-router';
import { useTheme } from '@mui/material/styles';
import useUploadCSV from 'src/hooks/use-upload-csv';
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';
import PropTypes from 'prop-types';
import { useGetAllEvents } from 'src/api/event';
import { enqueueSnackbar } from 'notistack';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';

import EventTicketDialog from './dialog/event-ticket-dialog';
import EventCreateDialog from './dialog/event-create-dialog';
import EditEventModal from './dialog/edit-event-modal';

const EventStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const getStatusColor = (status) => {
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

const fetcher = async (url) => {
  const response = await axiosInstance.get(url);
  return response.data;
};

const EventLists = ({ query }) => {
  const theme = useTheme();

  const auth = useAuthContext();

  const { data, isLoading, error: errorEvents, mutate } = useGetAllEvents();

  const notFound = !data?.events?.length;

  const [currentPage, setCurrentPage] = useState(1);

  const [anchorEl, setAnchorEl] = useState();

  const [openEdit, setOpenEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [openWhatsapp, setOpenWhatsapp] = useState(false);

  const [currentEvent, setCurrentEvent] = useState({});

  const navigate = useNavigate();

  const [openCSV, setOpenCSV] = useState(false);

  const [file, setFile] = React.useState(null);

  const { handleFileUpload } = useUploadCSV();

  const [anchorEl2, setAnchorEl2] = useState();

  const [currentEventId, setCurrentEventId] = useState('');

  // const [openTickets, setOpenTickets] = useState(false);

  const [anchorElFilter, setAnchorElFilter] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [openCreateTicket, setOpenCreateTicket] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const ticketDialog = useBoolean();

  const router = useRouter();

  const ITEMS_PER_PAGE = 6;

  const openn = Boolean(anchorEl);

  const [searchQuery, setSearchQuery] = useState('');

  const createDialog = useBoolean();

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    handleClose();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const filteredEvents = useMemo(() => {
    let filtered = data?.events || [];

    if (searchQuery) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    return filtered;
  }, [data?.events, searchQuery, statusFilter]);

  const sortedTableEvents = useMemo(() => {
    const sorted = [...filteredEvents];

    if (sortConfig.key) {
      sorted.sort((eventA, eventB) => {
        if (sortConfig.key === 'status') {
          const statusOrder = {
            live: 1,
            scheduled: 2,
            postponed: 3,
            completed: 4,
          };
          if (sortConfig.direction === 'asc') {
            return statusOrder[eventA.status] - statusOrder[eventB.status];
          }
          return statusOrder[eventB.status] - statusOrder[eventA.status];
        }

        if (sortConfig.key === 'date') {
          const dateA = new Date(eventA.date);
          const dateB = new Date(eventB.date);
          if (sortConfig.direction === 'asc') {
            return dateA - dateB;
          }
          return dateB - dateA;
        }

        return 0;
      });
    }

    return sorted;
  }, [filteredEvents, sortConfig]);

  // Update pagination to use filteredEvents
  // const paginatedEvents = useMemo(() => {
  //   return filteredEvents.slice(
  //     (currentPage - 1) * ITEMS_PER_PAGE,
  //     currentPage * ITEMS_PER_PAGE
  //   );
  // }, [filteredEvents, currentPage]);

// Helper function to check if time is 00:00
const isDefaultTime = (date) => {
  return dayjs(date).format('HH:mm') === '00:00';
};
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const openModal = (dialog) => {
    if (dialog) {
      dialog.onTrue();
    }
  };

  const [expandedRow, setExpandedRow] = useState(null);

  const renderEventCard = (event) => {
    const statusConfig = getStatusColor(event.status);

    return (
      <Card
        key={event.id}
        sx={{
          mb: 1,
          position: 'relative',
        }}
      >
        <CardActionArea onClick={() => router.push(paths.dashboard.events.details(event.id))}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Left side - Avatar and Event Info */}
              <Grid item xs={12} sm={8}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar alt={event.name} src="/logo/nexea.png" sx={{ width: 48, height: 48 }} />
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {event.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        icon={<Iconify icon={statusConfig.icon} width={16} height={16} />}
                        label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        size="small"
                        sx={{
                          pl: 0.5,
                          height: 24,
                          color: statusConfig.color,
                          bgcolor: statusConfig.bgColor,
                          '& .MuiChip-icon': { color: statusConfig.color },
                          '& .MuiChip-label': { px: 1, fontWeight: 600 },
                          '&:hover': {
                            bgcolor: statusConfig.bgColor,
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {fDate(event.date)} • {dayjs(event.date).format('HH:mm')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              {/* Right side - Stats and Actions */}
              <Grid item xs={12} sm={4}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                  {/* Attendees & Event Manager */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    {/* Attendees Count */}
                    <Tooltip title="Total Attendees">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Iconify
                          icon="mdi:account-group"
                          sx={{
                            color: 'text.secondary',
                            width: 20,
                            height: 20,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {event.attendeeCount || 0}
                        </Typography>
                      </Stack>
                    </Tooltip>

                    {/* Event Manager */}
                    <Tooltip title="Event Manager">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          alt={event.personInCharge.fullName}
                          src={event.personInCharge.avatar || ''}
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.75rem',
                          }}
                        >
                          {event.personInCharge.fullName.charAt(0)}
                        </Avatar>
                        {/* <Typography variant="body2" noWrap>
                          {/* {event.personInCharge.fullName} 
                        </Typography> */}
                      </Stack>
                    </Tooltip>
                  </Stack>

                  {/* More Actions Button */}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnchorEl(e.currentTarget);
                      setSelectedEvent(event);
                    }}
                    size="small"
                  >
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const renderTableView = () => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        overflow: { xs: 'auto', sm: 'hidden' },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          py: 1.5,
          px: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'light' ? '#f1f2f3' : 'background.neutral',
          minWidth: { xs: 800, sm: '100%' },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            width: '100%',
            '& > *:not(:last-child)': {
              borderRight: `1px solid ${theme.palette.mode === 'light' ? '#dedfe2' : 'rgba(255, 255, 255, 0.12)'}`,
              pr: 2,
              mr: 2,
            },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              width: '35%',
              color: theme.palette.mode === 'light' ? '#151517' : 'common.white',
              fontWeight: 550,
            }}
          >
            Event Name
          </Typography>

          {/* Status Column Header */}
          <Box
            sx={{
              width: '15%',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => handleSort('status')}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.mode === 'light' ? '#151517' : 'common.white',
                fontWeight: 550,
              }}
            >
              Status
            </Typography>
            <Stack sx={{ ml: 0.5 }}>
              <Iconify
                icon="eva:arrow-up-fill"
                width={14}
                sx={{
                  color:
                    sortConfig.key === 'status' && sortConfig.direction === 'asc'
                      ? 'grey.500'
                      : 'text.disabled',
                }}
              />
              <Iconify
                icon="eva:arrow-down-fill"
                width={14}
                sx={{
                  color:
                    sortConfig.key === 'status' && sortConfig.direction === 'desc'
                      ? 'grey.500'
                      : 'text.disabled',
                  mt: '-8px',
                }}
              />
            </Stack>
          </Box>

          {/* Date & Time Column Header */}
          <Box
            sx={{
              width: '20%',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => handleSort('date')}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.mode === 'light' ? '#151517' : 'common.white',
                fontWeight: 550,
              }}
            >
              Date & Time
            </Typography>
            <Stack sx={{ ml: 0.5 }}>
              <Iconify
                icon="eva:arrow-up-fill"
                width={14}
                sx={{
                  color:
                    sortConfig.key === 'date' && sortConfig.direction === 'asc'
                      ? 'grey.500'
                      : 'text.disabled',
                }}
              />
              <Iconify
                icon="eva:arrow-down-fill"
                width={14}
                sx={{
                  color:
                    sortConfig.key === 'date' && sortConfig.direction === 'desc'
                      ? 'grey.500'
                      : 'text.disabled',
                  mt: '-8px',
                }}
              />
            </Stack>
          </Box>

          <Typography
            variant="subtitle2"
            sx={{
              width: '25%',
              color: theme.palette.mode === 'light' ? '#151517' : 'common.white',
              fontWeight: 550,
            }}
          >
            Event Manager
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              width: '5%',
              color: theme.palette.mode === 'light' ? '#151517' : 'common.white',
              fontWeight: 550,
            }}
          >
            Actions
          </Typography>
        </Stack>
      </Stack>

      <Stack
        sx={{
          maxHeight: '70vh',
          overflow: 'auto',
          minWidth: { xs: 800, sm: '100%' },
        }}
      >
        {sortedTableEvents?.map((event) => {
          const statusConfig = getStatusColor(event.status);
          const isExpanded = expandedRow === event.id;

          const VITE_BASE_URL = 'http://localhost:81';
          console.log('events', event);
          return (
            <Stack
              key={event.id}
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Regular Row */}
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  px: 3,
                  py: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  // bgcolor: getRowBgColor(isExpanded, theme.palette.mode),
                  // color: getTextColor(isExpanded, theme.palette.mode),
                  // '&:hover': {
                  //   bgcolor: getHoverBgColor(isExpanded, theme.palette.mode),
                  // },
                  // '& .MuiTypography-root:not(.status-text)': {
                  //   color: getTextColor(isExpanded, theme.palette.mode),
                  // },
                  // '& .MuiSvgIcon-root:not(.status-icon), & .MuiIconify-root:not(.status-icon)': {
                  //   color: getIconColor(isExpanded, theme.palette.mode),
                  // },
                  // '& .event-secondary-text': {
                  //   color: getEventSecondaryTextColor(isExpanded, theme.palette.mode),
                  // },
                }}
                onClick={() => !isExpanded && router.push(paths.dashboard.events.details(event.id))}
              >
                {/* Event Details */}
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '35%' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Avatar
                      alt={event.name}
                      src="/logo/nexea.png"
                      sx={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                  <Stack spacing={0.25}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{
                        fontWeight: '500',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {event.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify
                        icon="mdi:account-group"
                        sx={{ width: 14, height: 14 }}
                        className="event-secondary-text"
                      />
                      <Typography variant="caption" className="event-secondary-text">
                        {event.attendeeCount || 0} Attendees
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>

                {/* Status - Preserving original colors */}
                <Box sx={{ width: '15%' }}>
                  <Box
                    sx={{
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      width: 'fit-content',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: statusConfig.bgColor,
                    }}
                  >
                    <Iconify
                      icon={statusConfig.icon}
                      className="status-icon"
                      sx={{
                        width: 16,
                        height: 16,
                        color: statusConfig.color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      className="status-text"
                      sx={{
                        color: statusConfig.color,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                    </Typography>
                  </Box>
                </Box>

                {/* Date & Time
                <Stack spacing={0.5} sx={{ width: '20%' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2">{fDate(event.date)}</Typography>
                  </Stack>
                  <Typography variant="caption" className="event-secondary-text">
                    {`${dayjs(event.date).format('HH:mm')} - ${dayjs(event.endDate).format('HH:mm')}`}
                  </Typography>
                </Stack> */}
{/* Date & Time */}
<Stack spacing={0.5} sx={{ width: '20%' }}>
  <Stack direction="row" alignItems="center" spacing={1}>
    <Typography variant="body2">{fDate(event.date)}</Typography>
  </Stack>
  {!(isDefaultTime(event.date) && isDefaultTime(event.endDate)) && (
    <Typography variant="caption" className="event-secondary-text">
      {`${dayjs(event.date).format('HH:mm')} - ${dayjs(event.endDate).format('HH:mm')}`}
    </Typography>
  )}
</Stack>

                {/* Event Manager */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '25%' }}>
                  <Avatar
                    alt={event.personInCharge.fullName}
                    src={event.personInCharge.avatar || ''}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '0.75rem',
                      bgcolor: getExpandedAvatarBgColor(isExpanded, theme.palette.mode),
                    }}
                  >
                    {event.personInCharge.fullName.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" noWrap>
                    {event.personInCharge.fullName}
                  </Typography>
                </Stack>

                {/* Action Button */}
                <Box sx={{ width: '5%', textAlign: 'right' }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedRow(isExpanded ? null : event.id);
                    }}
                    sx={{
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease-in-out',
                      // color: getExpandedIconColor(isExpanded, theme.palette.mode),
                    }}
                  >
                    <Iconify icon={isExpanded ? 'eva:close-fill' : 'eva:more-vertical-fill'} />
                  </IconButton>
                </Box>
              </Stack>

              {/* Expanded Actions Row */}
              <Collapse in={isExpanded} timeout={250} unmountOnExit>
                <Stack
                  direction="row"
                  sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    minHeight: 48,
                    px: 2,
                    bgcolor: 'background.paper',
                  }}
                  alignItems="center"
                  spacing={1}
                >
                  <Button
                    onClick={() => {
                      setOpenEdit(true);
                      setSelectedEvent(event);
                      setExpandedRow(null);
                    }}
                    startIcon={<Iconify icon="eva:edit-outline" width={20} height={20} />}
                    variant="text"
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      fontWeight: 500,
                      color: 'text.primary',
                      textTransform: 'none',
                      transition: 'background 0.2s, transform 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.04)',
                      },
                    }}
                    aria-label="Edit Event"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      ticketDialog.onTrue();
                      setSelectedEvent(event);
                      setExpandedRow(null);
                    }}
                    startIcon={<Iconify icon="eva:pricetags-outline" width={20} height={20} />}
                    variant="text"
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      fontWeight: 500,
                      color: 'text.primary',
                      textTransform: 'none',
                      transition: 'background 0.2s, transform 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.04)',
                      },
                    }}
                    aria-label="Manage Tickets"
                  >
                    Tickets
                  </Button>
                  <Button
                    onClick={() => {
                      setOpenCSV(true);
                      setSelectedEvent(event);
                      setExpandedRow(null);
                    }}
                    startIcon={<Iconify icon="eva:cloud-upload-outline" width={20} height={20} />}
                    variant="text"
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      fontWeight: 500,
                      color: 'text.primary',
                      textTransform: 'none',
                      transition: 'background 0.2s, transform 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.04)',
                      },
                    }}
                    aria-label="Upload CSV"
                  >
                    Upload CSV
                  </Button>
                  <Button
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
                      setExpandedRow(null);
                    }}
                    startIcon={<Iconify icon="eva:copy-outline" width={20} height={20} />}
                    variant="text"
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      fontWeight: 500,
                      color: 'text.primary',
                      textTransform: 'none',
                      transition: 'background 0.2s, transform 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.04)',
                      },
                    }}
                    aria-label="Copy Cart Link"
                  >
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => {
                      setOpenDelete(true);
                      setSelectedEvent(event);
                      setExpandedRow(null);
                    }}
                    startIcon={<Iconify icon="eva:trash-2-outline" width={20} height={20} />}
                    variant="text"
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      fontWeight: 500,
                      color: 'error.main',
                      textTransform: 'none',
                      transition: 'background 0.2s, transform 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'error.dark',
                        transform: 'scale(1.04)',
                      },
                    }}
                    aria-label="Delete Event"
                  >
                    Delete
                  </Button>
                </Stack>
              </Collapse>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );

  const handleOpenFilter = (event) => {
    setAnchorElFilter(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setAnchorElFilter(null);
  };

  const { data: usersData, isLoading: loadingUsers } = useSWR(
    openEdit ? endpoints.users.list : null,
    fetcher
  );

  const handleEventUpdated = (updatedEvent) => {
    if (data && data.events) {
      const updatedEvents = data.events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      );

      mutate({ ...data, events: updatedEvents }, false);

      if (selectedEvent && selectedEvent.id === updatedEvent.id) {
        setSelectedEvent(updatedEvent);
      }

      mutate();
    }
  };

  const getHoverBackgroundColor = (isActive, themeMode) => {
    if (isActive) {
      return themeMode === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)';
    }
    return themeMode === 'light' ? '#F9fafb' : 'rgba(255, 255, 255, 0.05)';
  };

  const getButtonColor = (isActive, themeMode) => {
    if (isActive) {
      return themeMode === 'light' ? '#000000' : 'common.white';
    }
    return themeMode === 'light' ? '#6B7280' : 'grey.400';
  };

  const getButtonBgColor = (isActive, themeMode) => {
    if (isActive) {
      return themeMode === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)';
    }
    return 'transparent';
  };

  const getExpandedIconColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? 'common.white' : 'grey.700';
    }
    return 'text.secondary';
  };

  const getExpandedAvatarBgColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? 'grey.300' : 'grey.700';
    }
    return 'default';
  };

  const getEventSecondaryTextColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? 'grey.300' : 'grey.600';
    }
    return 'text.secondary';
  };

  const getIconColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? 'common.white' : 'grey.700';
    }
    return 'inherit';
  };

  const getTextColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? 'common.white' : 'grey.900';
    }
    return 'text.primary';
  };

  const getHoverBgColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? 'grey.800' : 'grey.100';
    }
    return 'background.neutral';
  };

  const getRowBgColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? 'grey.800' : 'grey.100';
    }
    return 'transparent';
  };

  if (isLoading)
    return (
      <Stack direction="row" mt={2} gap={2} flexWrap="wrap">
        <Skeleton variant="rounded" width="400px" height="400px" />
        <Skeleton variant="rounded" width="400px" height="400px" />
        <Skeleton variant="rounded" width="400px" height="400px" />
        <Skeleton variant="rounded" width="400px" height="400px" />
      </Stack>
    );

  if (errorEvents?.message)
    enqueueSnackbar(errorEvents?.message, {
      variant: 'error',
    });

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mb: 2,
              width: '100%',
            }}
          >
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Events"
              InputProps={{
                startAdornment: (
                  <Iconify
                    icon="eva:search-fill"
                    sx={{
                      color: 'text.disabled',
                      width: 20,
                      height: 20,
                      mr: 1,
                    }}
                  />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 40,
                },
              }}
            />

            {isSmallScreen ? (
              <IconButton
                sx={{
                  border: 1,
                  width: 40,
                  height: 40,
                }}
                onClick={createDialog.onTrue}
              >
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            ) : (
              <Button
                onClick={createDialog.onTrue}
                variant="contained"
                sx={{
                  minWidth: 'fit-content',
                  height: 40,
                  fontWeight: 550,
                }}
              >
                Create Event
              </Button>
            )}
          </Stack>

          <Stack
            direction={isSmallScreen ? 'column' : 'row'}
            spacing={2}
            alignItems={isSmallScreen ? 'stretch' : 'center'}
            justifyContent="space-between"
            mb={3}
          >
            {isSmallScreen ? (
              // Mobile view - Filter button and menu
              <>
                <Button
                  color="inherit"
                  onClick={handleOpenFilter}
                  endIcon={<Iconify icon="eva:chevron-down-fill" />}
                  sx={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: 1,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="ic:round-filter-list" />
                    <Typography variant="body2">
                      {statusFilter
                        ? `Filter: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`
                        : 'All Events'}
                    </Typography>
                  </Stack>
                </Button>

                <Menu
                  anchorEl={anchorElFilter}
                  open={Boolean(anchorElFilter)}
                  onClose={handleCloseFilter}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: { width: '100%', maxWidth: 360, mt: 1.5 },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleStatusFilterChange('');
                      handleCloseFilter();
                    }}
                    sx={{
                      color: statusFilter === '' ? 'primary.main' : 'text.primary',
                      fontWeight: statusFilter === '' ? 'fontWeightBold' : 'regular',
                    }}
                  >
                    <ListItemIcon>
                      <Iconify
                        icon="mdi:check-circle"
                        sx={{
                          color: statusFilter === '' ? 'primary.main' : 'text.disabled',
                          visibility: statusFilter === '' ? 'visible' : 'hidden',
                        }}
                      />
                    </ListItemIcon>
                    All Events
                  </MenuItem>
                  {Object.values(EventStatus).map((status) => {
                    const statusConfig = getStatusColor(status);
                    return (
                      <MenuItem
                        key={status}
                        onClick={() => {
                          handleStatusFilterChange(status);
                          handleCloseFilter();
                        }}
                        sx={{
                          color: statusFilter === status ? 'primary.main' : 'text.primary',
                          fontWeight: statusFilter === status ? 'fontWeightBold' : 'regular',
                        }}
                      >
                        <ListItemIcon>
                          <Iconify
                            icon={statusConfig.icon}
                            sx={{
                              color: statusFilter === status ? 'primary.main' : statusConfig.color,
                            }}
                          />
                        </ListItemIcon>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </>
            ) : (
              // Desktop view - Filter chips in tray design
              <Stack
                direction="row"
                sx={{
                  minWidth: 'min-content',
                  position: 'relative',
                  mb: -1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  '& .MuiButton-root': {
                    fontSize: '0.875rem',
                    fontWeight: 450,
                  },
                }}
              >
                <Button
                  onClick={() => handleStatusFilterChange('')}
                  disableRipple
                  sx={{
                    minWidth: 'max-content',
                    height: '32px',
                    px: 1.5,
                    color: getButtonColor(statusFilter === '', theme.palette.mode),
                    bgcolor: getButtonBgColor(statusFilter === '', theme.palette.mode),
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    '&:hover': {
                      bgcolor: getHoverBackgroundColor(statusFilter === '', theme.palette.mode),
                    },
                  }}
                >
                  All Events
                </Button>
                {Object.values(EventStatus).map((status, index) => {
                  const statusConfig = getStatusColor(status);
                  return (
                    <Button
                      key={status}
                      onClick={() => handleStatusFilterChange(status)}
                      disableRipple
                      startIcon={
                        <Iconify icon={statusConfig.icon} sx={{ width: 18, height: 18 }} />
                      }
                      sx={{
                        minWidth: 'max-content',
                        height: '32px',
                        px: 1.5,
                        color: getButtonColor(statusFilter === status, theme.palette.mode),
                        bgcolor: getButtonBgColor(statusFilter === status, theme.palette.mode),
                        borderRight:
                          index !== Object.values(EventStatus).length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: getHoverBackgroundColor(
                            statusFilter === status,
                            theme.palette.mode
                          ),
                        },
                      }}
                    >
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </Button>
                  );
                })}
              </Stack>
            )}

            {/* <ToggleButtonGroup
              value={viewFormat}
              exclusive
              onChange={handleViewFormatChange}
              aria-label="view format"
              size="small"
              sx={{ 
                ...(isSmallScreen && {
                  width: '100%',
                  '& .MuiToggleButton-root': {
                    flex: 1
                  }
                })
              }}
            >
              <ToggleButton value="card" aria-label="card view">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="material-symbols:grid-view" />
                  {isSmallScreen && <Typography variant="body2">Grid View</Typography>}
                </Stack>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="material-symbols:list" />
                  {isSmallScreen && <Typography variant="body2">List View</Typography>}
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup> */}
          </Stack>
        </Grid>

        <Grid item xs={12}>
          {isLoading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={120} />
              ))}
            </Stack>
          ) : (
            <>
              {filteredEvents?.length === 0 ? (
                <Stack alignItems="center" gap={5} my={10}>
                  <img src="/assets/empty.svg" alt="empty" width={300} />
                  <Typography>
                    {searchQuery
                      ? `No events with name "${searchQuery}" to display.`
                      : 'No events available for the selected status.'}
                  </Typography>
                </Stack>
              ) : (
                renderTableView()
              )}
            </>
          )}
        </Grid>
      </Grid>

      {!!data && data.events?.length > ITEMS_PER_PAGE && (
        <Pagination
          count={Math.ceil(data.events.length / ITEMS_PER_PAGE)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            mt: 8,
            justifyContent: 'center',
          }}
        />
      )}

      {/* Delete modal */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ mb: 1, mt: 3 }}>
          <Box
            sx={{
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Iconify icon="mdi:alert" color="red" width={30} />
          </Box>
        </Box>
        <DialogTitle
          id="alert-dialog-title"
          sx={{ textAlign: 'center', fontSize: '1.75rem', mb: -2, mt: -2 }}
        >
          Delete Event
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center" sx={{ fontSize: '1rem' }}>
            Are you sure you want to delete this event? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            onClick={() => setOpenDelete(false)}
            sx={{
              borderRadius: 6,
              backgroundColor: '#f0f0f0',
              color: '#555',
              flex: 1,
              height: '48px',
              '&:hover': {
                backgroundColor: '#d0d0d0',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // handleDelete(currentEvent.id);
              setOpenDelete(false);
              handleClose();
            }}
            autoFocus
            sx={{
              borderRadius: 6,
              color: 'white',
              backgroundColor: 'red',
              flex: 1,
              height: '48px',
              '&:hover': {
                backgroundColor: '#c62828',
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Whatsapp Modal */}
      {/* <Dialog
        open={openWhatsapp}
        onClose={() => setOpenWhatsapp(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Edit Whatsapp</DialogTitle>

        <DialogContent>
          <Formik
            initialValues={{
              name: currentEvent?.name,
              description: currentEvent?.description,
              date: currentEvent?.date,
              personInCharge: currentEvent?.personInCharge?.id,
              tickera_api: currentEvent?.tickera_api,
              status: currentEvent?.status,
            }}
            onSubmit={(values, { setSubmitting }) => {
              axiosInstance
                .put(`${endpoints.events.update}/${currentEvent?.id}`, values)
                .then((response) => {
                  setSubmitting(false);
                  // fetchEvents();
                  toast.success('Event updated successfully.');
                })
                .catch((error) => {
                  console.error('Error updating event:', error);
                  setSubmitting(false);
                  toast.error('Update Failed, Try again!');
                });
              handleCloseEdit();
            }}
          >
            {({ isSubmitting, setFieldValue, values }) => <Form />}
          </Formik>
        </DialogContent>
      </Dialog> */}

      {/* Edit Event Modal */}
      <EditEventModal
        open={openEdit}
        onClose={handleCloseEdit}
        selectedEvent={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />

      {/* Upload CSV Modal – for attendees */}
      <Dialog
        open={openCSV}
        onClose={() => setOpenCSV(false)}
        aria-labelledby="upload-dialog-title"
        aria-describedby="upload-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="upload-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt="Event"
            src="/logo/nexea.png"
            sx={{ width: 64, height: 64, marginRight: 2 }}
          />
          <Box>
            <Typography variant="h6">{selectedEvent?.name}</Typography>
            <Typography variant="subtitle1">Upload Attendees</Typography>
          </Box>
        </DialogTitle>
        <Divider sx={{ my: -1, mb: 3 }} />
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'flex-start' }}>
            Upload a CSV file of the attendees.
          </Typography>
          {file ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 2, border: '1px solid #ccc', padding: 1, borderRadius: 1 }}
            >
              <Iconify icon="mdi:file-csv" />
              <Typography variant="body2">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
              <IconButton
                onClick={() => {
                  setFile(null);
                }}
                color="error"
                size="small"
                sx={{ marginLeft: 'auto' }}
              >
                <Iconify icon="mdi:close-circle" />
              </IconButton>
            </Stack>
          ) : (
            <Button
              variant="contained"
              component="label"
              sx={{
                marginTop: 2,
                backgroundColor: '#3874cb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 1,
                height: '40px',
                '&:hover': {
                  backgroundColor: '#2e5a9b',
                },
              }}
            >
              <Iconify icon="material-symbols:upload" sx={{ marginRight: 1 }} />
              Choose File (.csv)
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(event) => {
                  const selectedFile = event.target.files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                  }
                }}
              />
            </Button>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => {
              setOpenCSV(false);
              setFile(null);
              handleClose();
            }}
            sx={{
              borderRadius: 6,
              backgroundColor: '#f0f0f0',
              height: '36px',
              padding: '0 16px',
              color: '#555',
              '&:hover': {
                backgroundColor: '#d0d0d0',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleFileUpload(file, selectedEvent.id);
              setOpenCSV(false);
              handleClose();
            }}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 6,
              color: 'white',
              height: '36px',
              padding: '0 16px',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
            }}
            disabled={!file}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <EventTicketDialog
        open={ticketDialog.value}
        onClose={ticketDialog.onFalse}
        tickets={selectedEvent?.ticketType}
        event={selectedEvent}
      />

      <EventCreateDialog open={createDialog.value} onClose={createDialog.onFalse} />
    </Box>
  );
};

export default EventLists;

EventLists.propTypes = {
  query: PropTypes.string,
};
// TestCard.propTypes = {
//   backgroundImage: PropTypes.string.isRequired,
// };
