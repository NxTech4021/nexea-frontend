import React from 'react';

import { Box, Stack, Typography, ListItemText } from '@mui/material';

import Image from 'src/components/image';

const TicketPaymentCard = () => (
  <Box height={1}>
    <Stack
      sx={{
        borderRadius: 2,
        height: 1,
        overflow: 'hidden',
        color: 'whitesmoke',
        bgcolor: 'white',
      }}
    >
      <Box sx={{ bgcolor: 'black', p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Image src="/assets/tickets/ticket-3.svg" width={25} />
          <ListItemText
            primary="Payment"
            secondary="All transactions are secure and encrypted."
            primaryTypographyProps={{ variant: 'subtitle1' }}
            secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
          />
        </Stack>
      </Box>
      <Typography>asds</Typography>
    </Stack>
  </Box>
);

export default TicketPaymentCard;
