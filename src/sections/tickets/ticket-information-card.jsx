import React from 'react';

import { Box, Stack, Typography, ListItemText } from '@mui/material';

import Image from 'src/components/image';

const TicketInformationCard = () => (
  <Box>
    <Stack
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        color: 'whitesmoke',
        bgcolor: 'white',
      }}
    >
      <Box sx={{ bgcolor: 'black', p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Image src="/assets/tickets/ticket-2.svg" width={20} />
          <ListItemText
            primary="Billing Information"
            secondary="Personal and contact information of the buyer."
            primaryTypographyProps={{ variant: 'subtitle1' }}
            secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
          />
        </Stack>
      </Box>
      <Typography>asds</Typography>
    </Stack>
  </Box>
);

export default TicketInformationCard;
