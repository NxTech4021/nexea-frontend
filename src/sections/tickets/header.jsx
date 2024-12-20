import React from 'react';

import { Stack, AppBar, Typography } from '@mui/material';

import Image from 'src/components/image';

const TickerPurchaseHeader = () => {
  console.log('Header');

  return (
    <AppBar sx={{ bgcolor: '#000000', color: 'whitesmoke', p: 2 }} position="fixed">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={{ sm: 5, md: 15 }}
      >
        <Image src="/assets/nexea.png" width={120} />
        <Typography
          sx={{
            fontWeight: 600,
          }}
        >
          Checkout
        </Typography>
      </Stack>
    </AppBar>
  );
};

export default TickerPurchaseHeader;
