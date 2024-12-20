import React from 'react';

import { Box, Grid, Stack } from '@mui/material';

import TickerPurchaseHeader from '../header';
import TicketPaymentCard from '../ticket-payment-card';
import TicketSelectionCard from '../ticket-selection-card';
import TicketInformationCard from '../ticket-information-card';

const TicketPurchaseView = () => (
  <>
    <TickerPurchaseHeader />
    <Box px={{ xs: 2, md: 15 }} bgcolor="#F4F4F4" minHeight="100vh" overflow="hidden" pt={12}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
            <TicketSelectionCard />

            <TicketInformationCard />
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <TicketPaymentCard />
        </Grid>
      </Grid>
    </Box>
  </>
);

export default TicketPurchaseView;
