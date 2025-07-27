/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/no-unresolved */

import dayjs from 'dayjs';

import 'react-toastify/dist/ReactToastify.css';

import React, { useMemo, useState } from 'react';
// import Pagination from '@mui/material/Pagination';
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
  List,
  ListItemText,
  ListItem,
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

import { TablePaginationCustom } from 'src/components/table';
import EventTicketDialog from './dialog/event-ticket-dialog';
import EventCreateDialog from './dialog/event-create-dialog';
import EditEventModal from './dialog/edit-event-modal';
import { toast } from 'sonner';

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

  // Minimalistic palette - theme aware
  const textColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const iconColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const hoverBg = theme.palette.mode === 'light' ? '#f3f3f3' : '#2c2c2c';
  const borderColor = theme.palette.mode === 'light' ? '#eee' : '#333';
  const cardBgColor = theme.palette.mode === 'light' ? '#fff' : '#1e1e1e';

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

  const [statusFilter, setStatusFilter] = useState('ACTIVE');

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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
  const isDefaultTime = (date) => dayjs(date).format('HH:mm') === '00:00';

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const openModal = (dialog) => {
    if (dialog) {
      dialog.onTrue();
    }
  };

  const [expandedRow, setExpandedRow] = useState(null);

  const getHoverBackgroundColor = (isActive, themeMode) => {
    if (!isActive) {
      return themeMode === 'light' ? '#f3f3f3' : '#2c2c2c';
    }
    return themeMode === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)';
  };

  const getBackgroundColor = (isExpanded, themeMode) => {
    if (isExpanded) {
      return themeMode === 'light' ? '#f8f9fa' : '#2c2c2c';
    }
    return 'transparent';
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
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: event.eventSetting?.bgColor || 'background.neutral',
                      flexShrink: 0,
                    }}
                  >
                    <Avatar
                      alt={event.name}
                      src={event.eventSetting?.eventLogo || '/logo/nexea.png'}
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: event.eventSetting?.bgColor || 'background.neutral',
                        '& img': {
                          objectFit: 'contain',
                          width: '70%',
                          height: '70%',
                          margin: 'auto',
                        },
                      }}
                    />
                  </Box>
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
        border: `1px solid ${theme.palette.mode === 'light' ? '#eee' : '#333'}`,
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e',
        overflow: { xs: 'auto', sm: 'hidden' },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#eee' : '#333'}`,
          bgcolor: theme.palette.mode === 'light' ? '#f3f3f3' : '#333',
          minWidth: { xs: 800, sm: '100%' },
          display: { xs: 'none', md: 'flex' }, // Hide header on mobile
        }}
      >
        <Box sx={{ width: '35%', display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: theme.palette.mode === 'light' ? '#111' : '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Event Name
          </Typography>
        </Box>
        <Box sx={{ width: '15%', display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: theme.palette.mode === 'light' ? '#111' : '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Status
          </Typography>
        </Box>
        <Box sx={{ width: '15%', display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: theme.palette.mode === 'light' ? '#111' : '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Date & Time
          </Typography>
        </Box>
        <Box sx={{ width: '15%', display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: theme.palette.mode === 'light' ? '#111' : '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Event Manager
          </Typography>
        </Box>
        <Box sx={{ width: '15%', display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: theme.palette.mode === 'light' ? '#111' : '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Check-in Status
          </Typography>
        </Box>
        <Box
          sx={{ width: '5%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
        >
          <Typography
            sx={{
              color: theme.palette.mode === 'light' ? '#111' : '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Actions
          </Typography>
        </Box>
      </Stack>

      {/* Mobile Section Header */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#eee' : '#333'}`,
          bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : '#1e1e1e',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: theme.palette.mode === 'light' ? '#666' : '#aaa',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {sortedTableEvents?.length || 0} Events Listed
        </Typography>
      </Box>

      <Stack
        sx={{
          minWidth: { xs: '100%', sm: '100%' },
        }}
      >
        {sortedTableEvents
          ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          ?.map((event) => {
            const statusConfig = getStatusColor(event.status);

            const isExpanded = expandedRow === event.id;

            const orders = event?.order?.filter((a) => a.status === 'paid') || [];

            const attendees = orders?.flatMap((a) => a?.attendees) || [];

            const checkedInCount = attendees.filter(
              (attendee) => attendee.status === 'checkedIn'
            ).length;

            const notCheckedInCount = attendees.filter(
              (attendee) => attendee.status === 'pending'
            ).length;

            const totalAttendees = attendees.length;

            return (
              <Stack
                key={event.id}
                sx={{
                  borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#eee' : '#333'}`,
                  bgcolor: getBackgroundColor(isExpanded, theme.palette.mode),
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: getHoverBackgroundColor(!isExpanded, theme.palette.mode),
                  },
                }}
              >
                <Tooltip title={!isExpanded ? 'View Event Details' : ''} arrow placement="top">
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      display: { xs: 'none', md: 'flex' }, // Hide on mobile
                    }}
                    onClick={() =>
                      !isExpanded && router.push(paths.dashboard.events.details(event.id))
                    }
                  >
                    <Box sx={{ width: '35%', display: 'flex', alignItems: 'center' }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ width: '100%', overflow: 'hidden' }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: event.eventSetting?.bgColor || 'background.neutral',
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            component="img"
                            src={event.eventSetting?.eventLogo || '/logo/nexea.png'}
                            alt={event.name}
                            sx={{
                              width: '90%',
                              height: '90%',
                              objectFit: 'contain',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        </Box>
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{
                              fontWeight: 500,
                              color: theme.palette.mode === 'light' ? '#111' : '#fff',
                              fontSize: 13,
                              // overflow: 'hidden',
                              // textOverflow: 'ellipsis',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {event.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify
                              icon="mdi:account-group"
                              sx={{
                                width: 14,
                                height: 14,
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                              }}
                            >
                              {totalAttendees} Attendees
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>

                    <Box sx={{ width: '15%', display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon={statusConfig.icon}
                          sx={{ width: 14, height: 14, color: statusConfig.color }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: statusConfig.color, fontWeight: 600, fontSize: 13 }}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1).toLowerCase()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ width: '15%', display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        sx={{
                          color: theme.palette.mode === 'light' ? '#111' : '#fff',
                          fontSize: 13,
                        }}
                      >
                        {fDate(event.date)}
                      </Typography>
                      <Typography
                        sx={{
                          color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                          fontSize: 12,
                        }}
                      >
                        {dayjs(event.date).format('h:mm A')}
                      </Typography>
                    </Box>

                    <Box sx={{ width: '15%', display: 'flex', alignItems: 'center' }}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ overflow: 'hidden' }}
                      >
                        <Avatar
                          alt={event.personInCharge.fullName}
                          src={event.personInCharge.avatar || ''}
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}
                        >
                          {event.personInCharge.fullName.charAt(0)}
                        </Avatar>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            color: theme.palette.mode === 'light' ? '#111' : '#fff',
                            fontSize: 13,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {event.personInCharge.fullName}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ width: '15%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip
                        icon={
                          <Iconify
                            icon="eva:checkmark-circle-2-fill"
                            sx={{ width: 14, height: 14 }}
                          />
                        }
                        label={`${checkedInCount} Checked In`}
                        size="small"
                        sx={{
                          height: 20,
                          color: '#229A16',
                          bgcolor: 'rgba(34, 154, 22, 0.08)',
                          border: '1px solid rgba(34, 154, 22, 0.2)',
                          fontSize: 11,
                          fontWeight: 600,
                          width: 'fit-content',
                          '& .MuiChip-icon': {
                            color: '#229A16',
                            ml: 0.5,
                          },
                          '& .MuiChip-label': {
                            px: 0.75,
                          },
                        }}
                      />
                      <Chip
                        icon={
                          <Iconify icon="eva:close-circle-fill" sx={{ width: 14, height: 14 }} />
                        }
                        label={`${notCheckedInCount} Not Checked In`}
                        size="small"
                        sx={{
                          height: 20,
                          color: '#B72136',
                          bgcolor: 'rgba(183, 33, 54, 0.08)',
                          border: '1px solid rgba(183, 33, 54, 0.2)',
                          fontSize: 11,
                          fontWeight: 600,
                          width: 'fit-content',
                          '& .MuiChip-icon': {
                            color: '#B72136',
                            ml: 0.5,
                          },
                          '& .MuiChip-label': {
                            px: 0.75,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ width: '5%', display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRow(isExpanded ? null : event.id);
                        }}
                        startIcon={
                          <Iconify icon="eva:alert-circle-outline" width={20} height={20} />
                        }
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
                        aria-label="View Event Details"
                      >
                        <Iconify icon={isExpanded ? 'eva:close-fill' : 'eva:more-vertical-fill'} />
                      </IconButton>
                    </Box>
                  </Stack>

                  {/* Mobile Card View */}
                  <Box
                    sx={{
                      display: { xs: 'block', md: 'none' },
                      p: 2,
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                      },
                    }}
                    onClick={() =>
                      !isExpanded && router.push(paths.dashboard.events.details(event.id))
                    }
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: event.eventSetting?.bgColor || 'background.neutral',
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            component="img"
                            src={event.eventSetting?.eventLogo || '/logo/nexea.png'}
                            alt={event.name}
                            sx={{
                              width: '95%',
                              height: '95%',
                              objectFit: 'contain',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        </Box>
                        <Stack spacing={0.5}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: theme.palette.mode === 'light' ? '#111' : '#fff',
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {event.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Iconify
                              icon={statusConfig.icon}
                              sx={{ width: 14, height: 14, color: statusConfig.color }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: statusConfig.color, fontWeight: 600 }}
                            >
                              {event.status.charAt(0).toUpperCase() +
                                event.status.slice(1).toLowerCase()}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRow(isExpanded ? null : event.id);
                        }}
                        sx={{
                          color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                          p: 0.5,
                        }}
                      >
                        <Iconify
                          icon={isExpanded ? 'eva:close-fill' : 'eva:more-vertical-fill'}
                          width={20}
                        />
                      </IconButton>
                    </Box>

                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify
                            icon="eva:calendar-outline"
                            width={14}
                            sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}
                          >
                            {fDate(event.date)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify
                            icon="eva:clock-outline"
                            width={14}
                            sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}
                          >
                            {dayjs(event.date).format('h:mm A')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          alt={event.personInCharge.fullName}
                          src={event.personInCharge.avatar || ''}
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: '0.75rem',
                          }}
                        >
                          {event.personInCharge.fullName.charAt(0)}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.mode === 'light' ? '#666' : '#aaa' }}
                        >
                          {event.personInCharge.fullName}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip
                          icon={
                            <Iconify
                              icon="eva:checkmark-circle-2-fill"
                              sx={{ width: 12, height: 12 }}
                            />
                          }
                          label={`${checkedInCount} Checked In`}
                          size="small"
                          sx={{
                            height: 18,
                            color: '#229A16',
                            bgcolor: 'rgba(34, 154, 22, 0.08)',
                            border: '1px solid rgba(34, 154, 22, 0.2)',
                            fontSize: 10,
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: '#229A16',
                              ml: 0.25,
                            },
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}
                        />
                        <Chip
                          icon={
                            <Iconify icon="eva:close-circle-fill" sx={{ width: 12, height: 12 }} />
                          }
                          label={`${notCheckedInCount} Not Checked In`}
                          size="small"
                          sx={{
                            height: 18,
                            color: '#B72136',
                            bgcolor: 'rgba(183, 33, 54, 0.08)',
                            border: '1px solid rgba(183, 33, 54, 0.2)',
                            fontSize: 10,
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: '#B72136',
                              ml: 0.25,
                            },
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </Tooltip>

                {/* Expanded Actions Row */}
                <Collapse in={isExpanded} timeout={250} unmountOnExit>
                  {/* Desktop Actions */}
                  <Stack
                    direction="row"
                    sx={{
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      minHeight: 48,
                      px: 2,
                      bgcolor: 'background.paper',
                      display: { xs: 'none', md: 'flex' },
                    }}
                    alignItems="center"
                    spacing={1}
                  >
                    <Button
                      onClick={() => {
                        router.push(paths.dashboard.events.details(event.id));
                        setExpandedRow(null);
                      }}
                      startIcon={<Iconify icon="eva:alert-circle-outline" width={20} height={20} />}
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
                      aria-label="View Event Details"
                    >
                      Details
                    </Button>
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

                  {/* Mobile Actions */}
                  <Stack
                    sx={{
                      display: { xs: 'flex', md: 'none' },
                      p: 2,
                      bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : '#1e1e1e',
                      borderTop: '1px solid',
                      borderColor: theme.palette.mode === 'light' ? '#eee' : '#333',
                    }}
                    spacing={1}
                  >
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Button
                        fullWidth
                        onClick={() => {
                          router.push(paths.dashboard.events.details(event.id));
                          setExpandedRow(null);
                        }}
                        startIcon={<Iconify icon="eva:alert-circle-outline" width={20} />}
                        variant="outlined"
                        sx={{
                          py: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: textColor,
                          borderColor: theme.palette.mode === 'light' ? '#ddd' : '#444',
                          '&:hover': {
                            borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                            bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                          },
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        fullWidth
                        onClick={() => {
                          setOpenEdit(true);
                          setSelectedEvent(event);
                          setExpandedRow(null);
                        }}
                        startIcon={<Iconify icon="eva:edit-outline" width={20} />}
                        variant="outlined"
                        sx={{
                          py: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: textColor,
                          borderColor: theme.palette.mode === 'light' ? '#ddd' : '#444',
                          '&:hover': {
                            borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                            bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                          },
                        }}
                      >
                        Edit
                      </Button>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Button
                        fullWidth
                        onClick={() => {
                          ticketDialog.onTrue();
                          setSelectedEvent(event);
                          setExpandedRow(null);
                        }}
                        startIcon={<Iconify icon="eva:pricetags-outline" width={20} />}
                        variant="outlined"
                        sx={{
                          py: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: textColor,
                          borderColor: theme.palette.mode === 'light' ? '#ddd' : '#444',
                          '&:hover': {
                            borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                            bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                          },
                        }}
                      >
                        Tickets
                      </Button>
                      <Button
                        fullWidth
                        onClick={() => {
                          setOpenCSV(true);
                          setSelectedEvent(event);
                          setExpandedRow(null);
                        }}
                        startIcon={<Iconify icon="eva:cloud-upload-outline" width={20} />}
                        variant="outlined"
                        sx={{
                          py: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: textColor,
                          borderColor: theme.palette.mode === 'light' ? '#ddd' : '#444',
                          '&:hover': {
                            borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                            bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                          },
                        }}
                      >
                        Upload CSV
                      </Button>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Button
                        fullWidth
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
                        startIcon={<Iconify icon="eva:copy-outline" width={20} />}
                        variant="outlined"
                        sx={{
                          py: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: textColor,
                          borderColor: theme.palette.mode === 'light' ? '#ddd' : '#444',
                          '&:hover': {
                            borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                            bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                          },
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button
                        fullWidth
                        onClick={() => {
                          setOpenDelete(true);
                          setSelectedEvent(event);
                          setExpandedRow(null);
                        }}
                        startIcon={<Iconify icon="eva:trash-2-outline" width={20} />}
                        variant="outlined"
                        color="error"
                        sx={{
                          py: 1,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
            );
          })}
      </Stack>
      <TablePaginationCustom
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={sortedTableEvents?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
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

  const handleDelete = async (id) => {
    try {
      const res = await axiosInstance.delete(endpoints.events.delete(id));
      mutate();
      toast.success(res?.data?.message);
    } catch (error) {
      console.log(error);
      toast?.error('Error deleting event');
    }
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
            mb={1}
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
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                  gap: 1,
                  width: '100%',
                }}
              >
                {/* The 'All' status filter button is commented out as requested. */}
                {/* <Button
                  key="All"
                  onClick={() => handleStatusFilterChange('')}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: (() => {
                      if (statusFilter === '') {
                        return theme.palette.mode === 'light' ? '#fff' : '#000';
                      }
                      return textColor;
                    })(),
                    bgcolor: (() => {
                      if (statusFilter === '') {
                        return theme.palette.mode === 'light' ? '#111' : '#eee';
                      }
                      return 'transparent';
                    })(),
                    border: `1px solid ${borderColor}`,
                    borderRadius: 1,
                    minWidth: 'auto',
                    px: 1.5,
                    height: 32,
                    '&:hover': {
                      bgcolor: (() => {
                        if (statusFilter === '') {
                          return theme.palette.mode === 'light' ? '#222' : '#ddd';
                        }
                        return theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d';
                      })(),
                      borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                    },
                    '&:active': {
                      bgcolor: (() => {
                        if (statusFilter === '') {
                          return theme.palette.mode === 'light' ? '#000' : '#fff';
                        }
                        return theme.palette.mode === 'light' ? '#e0e0e0' : '#404040';
                      })(),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  All ({data?.events?.length || 0})
                </Button> */}
                {Object.values(EventStatus).map((status) => {
                  const count =
                    data?.events?.filter((event) => event.status === status).length || 0;
                  const buttonText = status.charAt(0) + status.slice(1).toLowerCase();

                  return (
                    <Button
                      key={status}
                      onClick={() => handleStatusFilterChange(status)}
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: (() => {
                          if (status === statusFilter) {
                            return theme.palette.mode === 'light' ? '#fff' : '#000';
                          }
                          return textColor;
                        })(),
                        bgcolor: (() => {
                          if (status === statusFilter) {
                            return theme.palette.mode === 'light' ? '#111' : '#eee';
                          }
                          return 'transparent';
                        })(),
                        border: `1px solid ${borderColor}`,
                        borderRadius: 1,
                        minWidth: 'auto',
                        px: 1.5,
                        height: 32,
                        '&:hover': {
                          bgcolor: (() => {
                            if (status === statusFilter) {
                              return theme.palette.mode === 'light' ? '#222' : '#ddd';
                            }
                            return theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d';
                          })(),
                          borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
                        },
                        '&:active': {
                          bgcolor: (() => {
                            if (status === statusFilter) {
                              return theme.palette.mode === 'light' ? '#000' : '#fff';
                            }
                            return theme.palette.mode === 'light' ? '#e0e0e0' : '#404040';
                          })(),
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {buttonText} ({count})
                    </Button>
                  );
                })}
              </Box>
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

      {/* {!!data && data.events?.length > ITEMS_PER_PAGE && (
        <Pagination
          count={Math.ceil(data.events.length / ITEMS_PER_PAGE)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            mt: 8,
            justifyContent: 'center',
          }}
        />
      )} */}

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
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="subtitle2">This action will remove:</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="oui:dot" />
                </ListItemIcon>
                <ListItemText primary="Orders" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="oui:dot" />
                </ListItemIcon>
                <ListItemText primary="Tickets" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="oui:dot" />
                </ListItemIcon>
                <ListItemText primary="Ticket Add Ons" />
              </ListItem>
            </List>
          </Box>
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
            onClick={async () => {
              await handleDelete(selectedEvent.id);
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
          <Box
            sx={{
              width: 64,
              height: 64,
              marginRight: 2,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selectedEvent?.eventSetting?.bgColor || 'background.neutral',
              overflow: 'hidden',
            }}
          >
            {selectedEvent?.eventSetting?.eventLogo ? (
              <Box
                component="img"
                src={selectedEvent.eventSetting.eventLogo}
                alt={selectedEvent?.name || 'Event'}
                sx={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Avatar
                alt={selectedEvent?.name || 'Event'}
                src={selectedEvent?.eventSetting?.eventLogo || '/logo/nexea.png'}
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
            )}
          </Box>
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
