/* eslint-disable react/prop-types */
import useSWR from 'swr';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Step,
  Stack,
  Dialog,
  Select,
  Button,
  Avatar,
  Divider,
  Stepper,
  MenuItem,
  StepLabel,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

import { useGetAllEvents } from 'src/api/event';

import FormProvider, { RHFUpload, RHFTextField, RHFDatePicker } from 'src/components/hook-form';

const steps = ['Event Information', 'Settings'];

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
                {!option?.department
                  ? `${option.fullName}`
                  : `${option.fullName} - ${option?.department}`}
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
  eventDate: yup.date().required('Event date is required'),
  startTime: yup.date().required('Start time is required'),
  endTime: yup.date().required('End time is required'),
  // themeColor: yup.string().required('Theme color is required'),
  sst: yup.number().required('SST is required').typeError('SST must be a number'),
  eventLogo: yup.object().required('Logo is required.'),
});

const EventCreateDialog = ({ open, onClose }) => {
  const { data, isLoading } = useSWR(endpoints.users.list, fetcher, {
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
  });

  const { mutate } = useGetAllEvents();
  const [activeStep, setActiveStep] = useState(0);
  const mdDown = useResponsive('down', 'md');

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      eventName: '',
      personInCharge: '',
      eventDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      themeColor: '',
      sst: '',
      eventLogo: null,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleCancel = () => {
    reset();
    setActiveStep(0);
    onClose();
  };

  const onDrop = useCallback(
    (e) => {
      const preview = URL.createObjectURL(e[0]);
      setValue('eventLogo', { file: e[0], preview });
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (eventData) => {
    // Validate eventDate
    if (dayjs(eventData.eventDate).isBefore(dayjs(), 'date')) {
      setError('eventDate', {
        type: 'custom',
        message: "Event date cannot be before today's date",
      });
      return;
    }

    // Validate endDate against eventDate
    if (dayjs(eventData.endDate).isBefore(dayjs(eventData.eventDate), 'date')) {
      setError('endDate', {
        type: 'custom',
        message: 'End date cannot be before start date',
      });
      return;
    }

    // Validate endTime against startTime if same day
    if (
      dayjs(eventData.eventDate).isSame(dayjs(eventData.endDate), 'date') &&
      dayjs(eventData.endTime).isBefore(dayjs(eventData.startTime))
    ) {
      setError('endTime', { type: 'custom', message: 'End time cannot be before start time' });
      return;
    }

    try {
      // Format the startDateTime and endDateTime for submission
      const startDateTimeFormatted = `${dayjs(eventData.eventDate).format('YYYY-MM-DD')}T${dayjs(eventData.startTime).format('HH:mm')}`;
      const endDateTimeFormatted = `${dayjs(eventData.endDate).format('YYYY-MM-DD')}T${dayjs(eventData.endTime).format('HH:mm')}`;

      const formattedData = {
        ...eventData,
        date: startDateTimeFormatted,
        endDate: endDateTimeFormatted,
      };

      // Remove fields not needed in the API
      delete formattedData.startTime;
      delete formattedData.endTime;
      delete formattedData.eventDate;

      // Prepare FormData for file upload and event data
      const formData = new FormData();
      formData.append('data', JSON.stringify(formattedData));
      formData.append('eventLogo', eventData.eventLogo?.file);

      // Send the request to create the event
      const res = await axiosInstance.post(endpoints.events.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // On success, refresh the data and display success message
      mutate();
      // enqueueSnackbar(res?.data?.message);
      enqueueSnackbar(res?.data?.message || 'Event created successfully', { variant: 'success' });

      handleCancel();
    } catch (error) {
      // Handle errors
      enqueueSnackbar(error?.message, { variant: 'error' });
    }
  });

  const startTimeValue = watch('startTime'); // Watch for startTime changes

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      fullScreen={mdDown}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(to bottom, #ffffff, #f9fafc)'
              : 'linear-gradient(to bottom, #1a202c, #2d3748)',
        },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 3,
            px: 4,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(245, 247, 250, 0.85)'
                : 'rgba(26, 32, 44, 0.85)',
          }}
        >
          <Avatar
            alt="Event"
            src="/logo/nexea.png"
            sx={{
              width: 58,
              height: 58,
              marginRight: 2.5,
              border: (theme) => `3px solid ${theme.palette.background.paper}`,
              backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f0f4f8' : '#2d3748'),
            }}
          />
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                color: (theme) => theme.palette.text.primary,
                letterSpacing: '-0.3px',
                mb: 0.5,
              }}
            >
              Create Event
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.85rem',
              }}
            >
              Start creating an event ticket!
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent
          sx={{
            p: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Stepper sx={{ mb: 2 }} activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};

              return (
                <Step
                  key={label}
                  {...stepProps}
                  sx={{
                    '& .MuiStepIcon-root.Mui-active': {
                      color: 'black',
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: 'black',
                    },
                    '& .MuiStepIcon-root.Mui-error': {
                      color: (theme) => theme.palette.error.main,
                    },
                  }}
                >
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>

          {activeStep === 0 && (
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2.5}>
              <Stack width={1}>
                <InputLabel required>Event Name</InputLabel>
                <RHFTextField
                  name="eventName"
                  placeholder="Enter the name of your event"
                  fullWidth
                />
              </Stack>

              <RenderSelectField
                name="personInCharge"
                control={control}
                label="Person in Charge"
                options={!isLoading && data}
                required
              />

              <Stack width={1}>
                <InputLabel required>SST</InputLabel>
                <RHFTextField
                  name="sst"
                  type="number"
                  placeholder="SST in %"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
              </Stack>
              {/* Date picker */}
              <Box display="flex" width="100%" justifyContent="space-between">
                <Box width="48%">
                  <RHFDatePicker name="eventDate" label="Event Date" minDate={dayjs()} required />
                </Box>
                <Box width="48%">
                  <RHFDatePicker
                    name="endDate"
                    label="End Date"
                    minDate={watch('eventDate')}
                    required
                  />
                </Box>
              </Box>

              {/* Time pickers row */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={1}>
                <Box width={{ xs: 1, sm: 1 / 2 }}>
                  {/* Start Time Picker */}
                  <Stack width={1} spacing={1}>
                    <InputLabel required>Start Time</InputLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Controller
                        name="startTime"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TimePicker
                            value={field.value}
                            onChange={(newValue) => field.onChange(newValue)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!fieldState.error,
                                helperText: fieldState.error ? fieldState.error.message : '',
                                placeholder: 'Select start time',
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Box>
                <Box width={{ xs: 1, sm: 1 / 2 }}>
                  {/* End Time Picker */}
                  <Stack width={1} spacing={1}>
                    <InputLabel required>End Time</InputLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Controller
                        name="endTime"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TimePicker
                            value={field.value}
                            onChange={(newValue) => field.onChange(newValue)}
                            minTime={startTimeValue} // Ensure the end time can't be before start time
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!fieldState.error,
                                helperText: fieldState.error ? fieldState.error.message : '',
                                placeholder: 'Select end time',
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {activeStep === 1 && (
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2.5}>
              <Stack width={1}>
                <InputLabel required>Event Logo</InputLabel>
                <RHFUpload name="eventLogo" type="file" onDrop={onDrop} />
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(26, 32, 44, 0.5)',
            borderTop: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748'),
          }}
        >
          {activeStep !== 0 ? (
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{
                borderRadius: 4,
                height: '46px',
                padding: '0 24px',
                fontWeight: 600,
                borderColor: (theme) => (theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568'),
                color: (theme) => (theme.palette.mode === 'light' ? '#64748b' : '#a0aec0'),
                borderWidth: '1.5px',
                letterSpacing: '0.3px',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(74, 85, 104, 0.2)',
                  borderColor: (theme) => (theme.palette.mode === 'light' ? '#cbd5e1' : '#718096'),
                },
              }}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: 4,
                height: '46px',
                padding: '0 24px',
                fontWeight: 600,
                borderColor: (theme) => (theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568'),
                color: (theme) => (theme.palette.mode === 'light' ? '#64748b' : '#a0aec0'),
                borderWidth: '1.5px',
                letterSpacing: '0.3px',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(74, 85, 104, 0.2)',
                  borderColor: (theme) => (theme.palette.mode === 'light' ? '#cbd5e1' : '#718096'),
                },
              }}
            >
              Cancel
            </Button>
          )}

          {activeStep === steps.length - 1 ? (
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isSubmitting}
              sx={{
                borderRadius: 4,
                height: '46px',
                padding: '0 28px',
                fontWeight: 600,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? '#38bdf8' : '#3182ce',
                color: 'white',
                textTransform: 'none',
                fontSize: '0.95rem',
                letterSpacing: '0.3px',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? '#0ea5e9' : '#2b6cb0',
                  boxShadow: 'none',
                },
              }}
            >
              Create
            </LoadingButton>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                borderRadius: 4,
                height: '46px',
                padding: '0 28px',
                fontWeight: 600,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? '#38bdf8' : '#3182ce',
                color: 'white',
                textTransform: 'none',
                fontSize: '0.95rem',
                letterSpacing: '0.3px',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? '#0ea5e9' : '#2b6cb0',
                  boxShadow: 'none',
                },
              }}
            >
              Next
            </Button>
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
