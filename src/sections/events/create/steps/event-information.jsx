import React from 'react';

import { Box, Typography } from '@mui/material';

import { useGetUser } from 'src/hooks/use-get-user';

import { RHFTextField } from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/rhf-datePicker';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';

const EventInformation = () => {
  const { data, isLoading } = useGetUser();

  return (
    <Box mt={2}>
      <Typography variant="h6">Event Information</Typography>
      <Box
        mt={2}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2,1fr)' }}
        gap={2}
      >
        <RHFTextField name="eventName" label="Event Name" />
        <RHFAutocomplete
          name="personInCharge"
          label="Person In Charge"
          options={(!isLoading && data) || []}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <RHFTextField name="eventDescription" label="Event Description" />
        <RHFDatePicker name="startDate" />
      </Box>
    </Box>
  );
};

export default EventInformation;
