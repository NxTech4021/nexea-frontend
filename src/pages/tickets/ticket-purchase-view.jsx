import React from 'react';
import { Helmet } from 'react-helmet-async';

import { Box, Stack, Button, Typography } from '@mui/material';

import { useParams } from 'src/routes/hooks';

import Image from 'src/components/image';

import TicketPurchaseView from 'src/sections/tickets/view/view';

const Page = () => {
  const { event } = useParams();

  const eventArray = event.split('@');
  const eventId = eventArray[eventArray.length - 1];
  // let eventId = eventArray[eventArray.length - 1];

  // if (localStorage.getItem('eventId')) eventId = localStorage.getItem('eventId');

  if (!eventId) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Stack alignItems="center" justifyContent="center" spacing={3}>
          <Image
            src="/assets/illustrations/404-notfound.svg"
            width={{ xs: 200, md: 400, xl: 600 }}
            alt="404 Not Found"
          />
          <Typography variant="subtitle1" color="text.secondary">
            Event not found
          </Typography>

          {/* This will be the event landing page link */}
          <Button variant="outlined" sx={{ borderRadius: 1 }}>
            Return back
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Buy Tickets</title>
      </Helmet>

      <TicketPurchaseView eventIdParams={eventId} />
    </>
  );
};

export default Page;
