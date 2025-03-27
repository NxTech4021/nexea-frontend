import useSWR from 'swr';
import React from 'react';
import dayjs from 'dayjs';

import {
  Box,
  Stack,
  Table,
  Button,
  TableRow,
  Container,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  ListItemText,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { fetcher } from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

const SuccessPayment = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();

  const { data, isLoading } = useSWR(`/api/order/${orderId}`, fetcher);

  if (!orderId || !data) {
    return (
      <Stack
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        alignItems="center"
        spacing={1}
      >
        <Typography variant="h1" color="text.secondary">
          Whoops, the page you are looking for was not found.
        </Typography>
      </Stack>
    );
  }

  if (data?.status === 'pending' || data?.status === 'failed') {
    return (
      <Stack alignItems="center" spacing={2} pt={15}>
        <Iconify icon="svg-spinners:clock" color="info.main" width={90} />

        <ListItemText
          primary="Order Processing"
          secondary="Order is still in processing."
          slotProps={{
            primary: {
              variant: 'subtitle1',
              color: 'text.secondary',
            },
          }}
          sx={{
            textAlign: 'center',
          }}
        />
      </Stack>
    );
  }

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
    <Container>
      <Stack alignItems="center" spacing={2} pt={15}>
        <Iconify icon="simple-line-icons:check" color="success.main" width={90} />

        <ListItemText
          primary="Order Completed Successfully!"
          secondary="Thank you for your purchase. Your ticket details are below."
          slotProps={{
            primary: {
              variant: 'subtitle1',
              color: 'text.secondary',
            },
          }}
          sx={{
            textAlign: 'center',
          }}
        />
      </Stack>

      <Box mt={3}>
        <Typography variant="subtitle2">Order Summary</Typography>
        <Box sx={{ border: 1, borderRadius: 1, borderColor: 'divider', p: 2, mt: 1 }}>
          <Stack direction="row" flexWrap="wrap">
            <ListItemText primary="Event Name" secondary={data?.event?.name || ''} />
            <ListItemText
              primary="Date and Time"
              secondary={dayjs(data?.event?.date).format('LLL') || ''}
            />
            <ListItemText primary="Order ID" secondary={<Label>{data?.orderNumber}</Label>} />
            <ListItemText primary="Total Tickets" secondary={data?.attendees?.length || 0} />
          </Stack>
        </Box>
      </Box>

      <Box mt={3}>
        <Typography variant="subtitle2">Attendee List</Typography>
        <TableContainer sx={{ mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Ticket ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.attendees.map((attendee) => (
                <TableRow key={attendee.id}>
                  <TableCell>{attendee.firstName}</TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>{attendee.phoneNumber}</TableCell>
                  <TableCell>
                    <Label>{attendee.ticket.ticketCode}</Label>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mt={5} textAlign="center">
        <Button
          variant="outlined"
          onClick={() => navigate(paths.dashboard.tickets.root(data?.event?.id))}
        >
          Continue shopping
        </Button>
      </Box>
    </Container>
  );
};

export default SuccessPayment;
