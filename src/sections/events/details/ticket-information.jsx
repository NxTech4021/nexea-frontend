import React from 'react';

import { PieChart } from '@mui/x-charts';
import { Card, Divider, CardHeader, CardContent } from '@mui/material';

const desktopOS = [
  {
    label: 'Startups',
    value: 72.72,
  },
  {
    label: 'Investors',
    value: 16.38,
  },
  {
    label: 'Speakers',
    value: 3.83,
  },
  {
    label: 'General',
    value: 2.42,
  },
];

const valueFormatter = (item) => `${item.value}%`;

const TicketInformation = () => (
  <Card sx={{ border: 1, borderColor: (theme) => theme.palette.divider, borderRadius: 2 }}>
    <CardHeader
      title="Ticket Details"
      titleTypographyProps={{
        variant: 'subtitle1',
      }}
      sx={{ py: 1.5 }}
    />
    <Divider />
    <CardContent>
      <PieChart
        height={200}
        series={[
          {
            data: desktopOS.slice(0, 5),
            innerRadius: 50,
            arcLabel: (params) => params.label ?? '',
            arcLabelMinAngle: 20,
            valueFormatter,
          },
        ]}
        skipAnimation={false}
      />
    </CardContent>
  </Card>
);

export default TicketInformation;
