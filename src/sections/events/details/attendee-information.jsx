import useSWR from 'swr';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import { grey } from '@mui/material/colors';
import Tooltip from '@mui/material/Tooltip';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Table,
  Stack,
  alpha,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  CircularProgress,
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
  const theme = useTheme();

  const { data, isLoading } = useSWR(`${endpoints.attendee.root}?eventId=${id}`, fetcher);

  const checkedInCount = data?.filter((attendee) => attendee.status === 'checkedIn').length;
  const notCheckedInCount = data?.filter((attendee) => attendee.status === 'pending').length;

  const filteredAttendees = data?.filter(
    (attendee) =>
      (activeTab === 0 && attendee.status === 'pending') ||
      (activeTab === 1 && attendee.status === 'checkedIn')
  );

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
            {data?.length}
          </Typography>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginBottom: '10px',
          }}
        >
          <Tooltip title="View Full Attendee List">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(`${paths.dashboard.events.attendees}/${id}`)}
              style={{
                width: '48px',
                height: '48px',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Iconify icon="mdi:account-group" width={26} height={26} />
            </Button>
          </Tooltip>
          <Tooltip title="Check In Attendees">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(`${paths.dashboard.events.qr}/${id}`)}
              style={{
                width: '48px',
                height: '48px',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                marginLeft: '10px',
              }}
            >
              <Iconify icon="bx:qr" width={26} height={26} />
            </Button>
          </Tooltip>
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

      <TableContainer
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: 1,
          borderColor: grey[200],
          borderRadius: 2,
        }}
      >
        <Table>
          <TableHead sx={{ borderTop: '1px solid', borderColor: grey[200] }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Ticket Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAttendees.map((attendee, index) => (
              <TableRow key={index}>
                <TableCell>{`${attendee.firstName}  ${attendee.lastName}`}</TableCell>
                <TableCell>{attendee.companyName}</TableCell>
                <TableCell>
                  <Chip label={attendee.ticket.ticketType.title} />
                </TableCell>
              </TableRow>
            ))}
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
