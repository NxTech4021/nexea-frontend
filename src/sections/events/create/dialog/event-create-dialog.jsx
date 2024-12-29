/* eslint-disable react/prop-types */
import useSWR from 'swr';
import React from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Dialog,
  Select,
  Button,
  MenuItem,
  InputLabel,
  DialogTitle,
  FormControl,
  ListItemText,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

import { useGetAllEvents } from 'src/api/event';

import FormProvider, { RHFTextField, RHFDatePicker } from 'src/components/hook-form';

const RenderSelectField = ({ name, control, label, options, required }) => (
  <Stack width={1} spacing={1}>
    <InputLabel required={required}>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth error={!!fieldState.error}>
          <Select
            {...field}
            displayEmpty
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
            renderValue={(option) =>
              options?.find((item) => item.id === option)?.fullName || 'Select an option'
            }
          >
            <MenuItem disabled value="">
              <em>Select an option</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {`${option.fullName} - ${option?.department}`}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  </Stack>
);

const EventCreateDialog = ({ open, onClose }) => {
  const { data, isLoading } = useSWR(endpoints.users.list, fetcher, {
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
  });

  const { mutate } = useGetAllEvents();

  const methods = useForm({
    defaultValues: {
      eventName: '',
      personInCharge: '',
      eventDate: null,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (eventData) => {
    try {
      const res = await axiosInstance.post(endpoints.events.create, eventData);
      mutate();
      enqueueSnackbar(res?.data?.message);
      reset();
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.message, {
        variant: 'error',
      });
    }
  });

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          bgcolor: (theme) => theme.palette.background.default,
        },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          <ListItemText
            primary="Create Event"
            secondary="Start creating your event tickets effortlessly!"
            primaryTypographyProps={{ variant: 'h5' }}
          />
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
            <RHFTextField
              name="eventName"
              label="Event Name"
              placeholder="Enter the name of your event"
            />

            <RenderSelectField
              name="personInCharge"
              control={control}
              label="Event Name"
              options={!isLoading && data}
              required
            />

            <RHFDatePicker name="eventDate" label="Event Date" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" sx={{ fontWeight: 400 }} onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            type="submit"
            sx={{ fontWeight: 400 }}
            loading={isSubmitting}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default EventCreateDialog;

EventCreateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
