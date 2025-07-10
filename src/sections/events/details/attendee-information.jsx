import useSWR from 'swr';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// import { grey } from '@mui/material/colors';
// import Tooltip from '@mui/material/Tooltip';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  // Table,
  Stack,
  alpha,
  Button,
  // TableRow,
  // TableBody,
  // TableCell,
  // TableHead,
  MenuItem,
  TextField,
  Typography,
  // TableContainer,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { fetcher, endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';

// Mock data - replace later
const attendees = [
  { name: 'Arif Sufri', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Afiq', company: 'NEXEA', ticketType: 'Standard - General', status: 'Checked In' },
  { name: 'Pawan', company: 'NEXEA', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Amira', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Aliah', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Pending' },
  { name: 'Samantha', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Ethan', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Lily', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Oliver', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Ava', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Noah', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Isabella', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Logan', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Sophia', company: 'Google', ticketType: 'Standard - General', status: 'Checked In' },
  { name: 'Mia', company: 'Google', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Alexander', company: 'Google', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Charlotte', company: 'Google', ticketType: 'Standard - Startup', status: 'Checked In' },
  { name: 'Benjamin', company: 'Google', ticketType: 'Standard - Startup', status: 'Pending' },
  { name: 'Emily', company: 'NEXEA', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Michael', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Pending' },
  { name: 'Hannah', company: 'NEXEA', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Daniel', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Pending' },
  { name: 'Sarah', company: 'NEXEA', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Joshua', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Pending' },
  { name: 'Jessica', company: 'NEXEA', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Matthew', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Pending' },
  { name: 'Ashley', company: 'NEXEA', ticketType: 'Standard - General', status: 'Pending' },
  { name: 'Joseph', company: 'NEXEA', ticketType: 'Standard - Startup', status: 'Pending' },
];

const TabsWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.7) : '#f2f5f7',
  borderRadius: 14,
  padding: '8px',
  display: 'flex',
  width: '100%',
  minWidth: 400,
  marginBottom: 16,
  marginTop: 10,
  border:
    theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.common.white, 0.1)}` : 'none',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    minWidth: 'unset',
    height: 200,
  },
}));

const TabButton = styled(Button)(({ theme, selected }) => {
  let textColor;
  if (selected) {
    textColor = theme.palette.mode === 'dark' ? '#ffffff' : '#000000';
  } else {
    textColor = theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.5) : '#68737f';
  }

  const hoverColor = theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary;

  return {
    position: 'relative',
    width: '50%',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: 600,
    color: textColor,
    zIndex: 1,
    transition: 'color 0.3s ease',
    '&:hover': {
      backgroundColor: 'transparent',
      color: hoverColor,
    },
    justifyContent: 'flex-start',
    paddingLeft: '32px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '50%',
    },
  };
});

const SliderIndicator = styled('div')(({ activeTab, theme }) => ({
  position: 'absolute',
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.grey[800], 0.9)
      : theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === 'dark'
      ? `0 0 8px 2px ${alpha(theme.palette.common.black, 0.5)}`
      : '0 2px 8px rgba(0, 0, 0, 0.05)',
  borderRadius: 10,
  transition: 'all 0.3s ease',
  border:
    theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.common.white, 0.1)}` : 'none',
  zIndex: 0,
  [theme.breakpoints.up('sm')]: {
    left: activeTab === 0 ? '8px' : 'calc(50% + 4px)',
    width: 'calc(50% - 12px)',
    height: 'calc(100% - 16px)',
    top: '8px',
  },
  [theme.breakpoints.down('sm')]: {
    left: '8px',
    width: 'calc(100% - 16px)',
    height: 'calc(50% - 12px)',
    top: activeTab === 0 ? '8px' : 'calc(50% + 4px)',
  },
}));

const AttendeeInformation = ({ id }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = React.useState('All');

  const theme = useTheme();

  const { data, isLoading } = useSWR(`${endpoints.attendee.root}?eventId=${id}`, fetcher);

  const attendeesData = React.useMemo(() => data?.attendees || [], [data]);

  const checkedInCount = attendeesData?.filter(
    (attendee) => attendee.status === 'checkedIn'
  ).length;

  const notCheckedInCount = attendeesData?.filter(
    (attendee) => attendee.status === 'pending'
  ).length;

  // const filteredAttendees = attendeesData?.filter(
  //   (attendee) =>
  //     (activeTab === 0 && attendee.status === 'pending') ||
  //     (activeTab === 1 && attendee.status === 'checkedIn')
  // );
  const ticketTypes = React.useMemo(() => {
    const types = new Set();
    attendeesData.forEach((a) => {
      if (a.ticket?.ticketType?.title) types.add(a.ticket.ticketType.title);
    });
    return Array.from(types);
  }, [attendeesData]);
  const filteredAttendees = attendeesData?.filter((attendee) => {
    const matchesTab =
      (activeTab === 0 && attendee.status === 'pending') ||
      (activeTab === 1 && attendee.status === 'checkedIn');
    const matchesSearch =
      attendee.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTicketType =
      ticketTypeFilter === 'All' || attendee.ticket?.ticketType?.title === ticketTypeFilter;
    return matchesTab && matchesSearch && matchesTicketType;
  });
  if (isLoading) {
    return (
      <Box
        sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Attendees
          </Typography>
          <Typography
            variant="h6"
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              marginTop: '2px',
            }}
          >
            {attendeesData?.length}
          </Typography>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginBottom: '10px',
          }}
        >
          <Stack
            direction="column"
            spacing={1}
            sx={{
              mb: 1,
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate(`${paths.dashboard.events.qr}/${id}`)}
              sx={{
                height: '42px',
                px: 2,
                py: 1,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: theme.palette.mode === 'light' ? 'grey.900' : 'common.white',
                color: theme.palette.mode === 'light' ? 'common.white' : 'grey.900',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? 'common.black' : 'grey.100',
                },
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'none',
                boxShadow: 'none',
              }}
            >
              <Iconify icon="bx:qr" width={20} height={20} />
              Check In
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate(`${paths.dashboard.events.attendees}/${id}`)}
              sx={{
                height: '42px',
                px: 2,
                py: 1,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: theme.palette.mode === 'light' ? 'text.primary' : 'common.white',
                borderColor: theme.palette.mode === 'light' ? 'grey.300' : 'grey.700',
                bgcolor: theme.palette.mode === 'light' ? 'common.white' : 'grey.800',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.700',
                  borderColor: theme.palette.mode === 'light' ? 'grey.400' : 'grey.600',
                },
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'none',
              }}
            >
              <Iconify icon="mdi:account-group" width={20} height={20} />
              Check-In List
            </Button>
          </Stack>
        </div>
      </div>

      <TabsWrapper>
        <SliderIndicator activeTab={activeTab} />
        <TabButton selected={activeTab === 0} onClick={() => setActiveTab(0)} disableRipple>
          <Stack direction="row" alignItems="center" spacing={2}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ea3323',
                flexShrink: 0,
              }}
            >
              <img
                src="/assets/userNotCheckedIn.svg"
                alt="NotCheckedIn"
                style={{ height: '30px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ marginBottom: '-3px', fontWeight: '550', fontSize: '14px' }}>
                Not Checked In
              </span>
              <Typography variant="body2" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                {notCheckedInCount}
              </Typography>
            </div>
          </Stack>
        </TabButton>

        <TabButton selected={activeTab === 1} onClick={() => setActiveTab(1)} disableRipple>
          <Stack direction="row" alignItems="center" spacing={2}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#7cd640',
                flexShrink: 0,
              }}
            >
              <img src="/assets/userCheckedIn.svg" alt="CheckedIn" style={{ height: '30px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ marginBottom: '-3px', fontWeight: '550', fontSize: '14px' }}>
                Checked In
              </span>
              <Typography variant="body2" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                {checkedInCount}
              </Typography>
            </div>
          </Stack>
        </TabButton>
      </TabsWrapper>
      <Box sx={{ mb: 1.5, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          placeholder="Search attendees by name or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <Iconify
                icon="eva:search-fill"
                sx={{
                  color: theme.palette.mode === 'light' ? '#888' : '#aaa',
                  width: 20,
                  height: 20,
                  mr: 1,
                }}
              />
            ),
          }}
          sx={{
            mb: { xs: 1, sm: 0 },
            '& .MuiOutlinedInput-root': {
              height: 44,
              backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e',
              '& fieldset': {
                borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
              },
            },
          }}
        />
        <TextField
          select
          label="Ticket Type"
          value={ticketTypeFilter}
          onChange={(e) => setTicketTypeFilter(e.target.value)}
          sx={{
            width: 200,
            '& .MuiOutlinedInput-root': {
              height: 44,
              backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e',
              '& fieldset': {
                borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'light' ? '#999' : '#666',
              },
            },
          }}
        >
          <MenuItem value="All">All </MenuItem>
          {ticketTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {filteredAttendees.length === 0 ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            py: 5,
            px: 2,
            color: theme.palette.text.secondary,
          }}
        >
          <Iconify
            icon="eva:search-fill"
            sx={{
              width: 40,
              height: 40,
              color: theme.palette.mode === 'light' ? 'grey.400' : 'grey.600',
              mb: 1,
            }}
          />
          <Typography variant="body2">No attendee found</Typography>
        </Stack>
      ) : (
        filteredAttendees.map((attendee, index) => (
          <Box
            key={attendee.id}
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              width: '100%',
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                Name:
              </Typography>
              <Typography sx={{ color: theme.palette.text.primary, fontSize: 13, fontWeight: 500 }}>
                {`${attendee.firstName} ${attendee.lastName}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                Company:
              </Typography>
              <Typography sx={{ color: theme.palette.text.primary, fontSize: 13, fontWeight: 500 }}>
                {attendee.companyName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                Ticket Type:
              </Typography>
              <Chip
                label={attendee.ticket.ticketType.title}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>
        ))
      )}

      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 2, fontSize: 13, lineHeight: 1 }}>Name</TableCell>
              <TableCell sx={{ py: 2, fontSize: 13, lineHeight: 1 }}>Company</TableCell>
              <TableCell sx={{ py: 2, fontSize: 13, lineHeight: 1 }}>Ticket Type</TableCell>
              <TableCell sx={{ py: 2, fontSize: 13, lineHeight: 1 }}>Ticket Add On</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAttendees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      py: 5,
                      px: 2,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Iconify
                      icon="eva:search-fill"
                      sx={{
                        width: 40,
                        height: 40,
                        color: theme.palette.mode === 'light' ? 'grey.400' : 'grey.600',
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2">No attendee found</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendees.map((attendee, index) => (
                <TableRow key={attendee.id}>
                  {/* Mobile layout - Card style */}

                  {/* Desktop layout - row style */}
                  <TableCell>
                    <Typography
                      sx={{
                        // width: '30%',
                        color: theme.palette.text.primary,
                        fontSize: 13,
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      {`${attendee.firstName} ${attendee.lastName}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        // width: '35%',
                        color: theme.palette.text.primary,
                        fontSize: 13,
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      {attendee.companyName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        // width: '35%',
                        display: { xs: 'none', md: 'flex' },
                      }}
                    >
                      <Chip
                        label={attendee.ticket.ticketType.title}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        // width: '35%',
                        display: { xs: 'none', md: 'flex' },
                      }}
                    >
                      <Chip
                        label={attendee.ticket.ticketAddOn?.addOn?.name || 'N/A'}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

AttendeeInformation.propTypes = {
  id: PropTypes.string.isRequired,
};

export default AttendeeInformation;
