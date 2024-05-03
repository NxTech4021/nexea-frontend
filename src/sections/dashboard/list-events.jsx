import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import {
  Chip,
  Table,
  Stack,
  Button,
  Divider,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
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

  // const popover = usePopover();
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/events');
  };

  const fetchEvent = async () => {
    try {
      const response = await axiosInstance.get(endpoints.events.list);
      const eventsArray = response.data;
      setEvents(eventsArray.events.filter((event) => event.status === 'live'));
      setStatus('Live');
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [events, status]);

  return (
    <>
      <Card>
        <CardHeader title="Events" subheader="List of events in Nexea" />
        <Box sx={{ mt: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Event Name</TableCell>
                  <TableCell>PIC</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Stack direction="row" gap={1} alignItems="center">
                        <Chip
                          label={status}
                          color="error"
                          icon={<Iconify icon="svg-spinners:pulse" />}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.personInCharge.name}</TableCell>
                    <TableCell>{dayjs(event.date).format('LL')}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`${paths.dashboard.events.qr}/${event.id}`)}
                      >
                        Check in attendees
                      </Button>
                    </TableCell>
                    {/* <TableCell>
                      <IconButton onClick={popover.onOpen}>
                        <Icon
                          icon="pepicons-pop:dots-y"
                          width={20}
                          color={popover.open ? 'inherit' : 'default'}
                        />
                      </IconButton>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Box sx={{ textAlign: 'end', px: 4, p: 3 }}>
          <Button onClick={handleClick}>View All</Button>
        </Box>
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
