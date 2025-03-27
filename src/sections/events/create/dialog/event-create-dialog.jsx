/* eslint-disable react/prop-types */
import useSWR from 'swr';
import React, { useState } from 'react';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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
  Stepper,
  Step,
  StepLabel,
  TextField,
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
            onBlur={() => field.onBlur()} 
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

const schema = yup.object().shape({
  eventName: yup.string().required('Event name is required'),
  personInCharge: yup.string().required('Person in charge is required'),
  eventDate: yup.date().required('Date is required'),
  themeColor: yup.string().required('Theme color is required'),
  sst: yup.number().required('SST is required').typeError('SST must be a number'),
});

const EventCreateDialog = ({ open, onClose }) => {
  const { data, isLoading } = useSWR(endpoints.users.list, fetcher, {
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
  });

  const { mutate } = useGetAllEvents();
  const [activeStep, setActiveStep] = useState(0);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      eventName: '',
      personInCharge: '',
      eventDate: null,
      themeColor: '',
      sst: '',
      logo: null,
    },
    mode: 'onChange', 
  });

  const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = methods;

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleCancel = () => {
    reset(); 
    setActiveStep(0); 
    onClose(); 
  };

  const onSubmit = handleSubmit(async (eventData) => {
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach((key) => {
        formData.append(key, eventData[key]);
      });
      if (eventData.logo) {
        formData.append('logo', eventData.logo);
      }

      const res = await axiosInstance.post(endpoints.events.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      mutate();
      enqueueSnackbar(res?.data?.message);
      handleCancel();
    } catch (error) {
      enqueueSnackbar(error?.message, { variant: 'error' });
    }
  });

  return (

    <Dialog open={open} maxWidth="md" fullWidth>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Create Event</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            <Step><StepLabel>Event Details</StepLabel></Step>
            <Step><StepLabel>Event Settings</StepLabel></Step>
          </Stepper>
          {activeStep === 0 && (
            <Box display="flex" flexDirection="column" gap={2}>
              <RHFTextField 
                name="eventName" 
                label="Event Name"
                onBlur={() => methods.trigger('eventName')}
              />
              <RenderSelectField 
                name="personInCharge" 
                control={control} 
                label="Person In Charge" 
                options={!isLoading && data} 
                required 
              />
              <RHFDatePicker 
                name="eventDate" 
                label="Event Date"
                onBlur={() => methods.trigger('eventDate')}
              />
            </Box>
          )}
          {activeStep === 1 && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                type="file"
                onChange={(e) => setValue('logo', e.target.files[0])}
                helperText="Upload event logo (PNG, JPG)"
              />
              <RHFTextField 
                name="themeColor" 
                label="Theme Color"
                onBlur={() => methods.trigger('themeColor')}
              />
              <RHFTextField 
                name="sst" 
                label="SST (%)" 
                type="number"
                onBlur={() => methods.trigger('sst')}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ color: 'purple' }}>Cancel</Button>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < 1 ? (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          ) : (
            <LoadingButton variant="contained" type="submit" loading={isSubmitting}>Create</LoadingButton>
          )}
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