import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  Stack,
  Divider,
  CardHeader,
  Typography,
  CardContent,
  ListItemText,
} from '@mui/material';

import Label from 'src/components/label';

const EventInformation = ({ event }) => {
  const items = [
    { title: 'Name', content: event.name },
    { title: 'Person In charge', content: event.personInCharge.fullName },
    { title: 'Event Date', content: dayjs(event.date).format('LL') },
    { title: 'Status', content: event.status },
  ];

  return (
    <Card
      sx={{ border: 1, borderColor: (theme) => theme.palette.divider, borderRadius: 2, width: 1 }}
    >
      <CardHeader
        title="Event Information"
        titleTypographyProps={{
          variant: 'subtitle1',
        }}
        sx={{ py: 1.5 }}
      />
      <Divider />
      <CardContent>
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
          {items.map((item, index) =>
            item.title === 'Status' ? (
              <Stack alignItems="start">
                <Typography variant="subtitle2">{item.title}</Typography>
                <Label color="success">{event.status}</Label>
              </Stack>
            ) : (
              <ListItemText key={index} primary={item.title} secondary={item.content} />
            )
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventInformation;

EventInformation.propTypes = {
  event: PropTypes.object,
};
