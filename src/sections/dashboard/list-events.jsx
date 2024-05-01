import dayjs from 'dayjs';
import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import {
  Table,
  Button,
  Divider,
  TableRow,
  MenuItem,
  TableBody,
  TableHead,
  TableCell,
  IconButton,
  TableContainer,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import axios, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';

const EventListsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('');

  const popover = usePopover();
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/events');
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(endpoints.events.list);
        const eventsArray = response.data;
        setEvents(eventsArray.events.filter((event) => event.status === 'live'));
        setStatus('Live');
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
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
                    <TableCell>{status}</TableCell>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.personInCharge.name}</TableCell>
                    <TableCell>{dayjs(event.date).format('DD-MMM-YYYY')}</TableCell>
                    <TableCell>
                      <IconButton onClick={popover.onOpen}>
                        <Icon
                          icon="pepicons-pop:dots-y"
                          width={20}
                          color={popover.open ? 'inherit' : 'default'}
                        />
                      </IconButton>
                    </TableCell>
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
      <CustomPopover
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
      </CustomPopover>
    </>
  );
};

export default EventListsDashboard;
