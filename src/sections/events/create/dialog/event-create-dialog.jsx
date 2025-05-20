/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
import useSWR from 'swr';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
// Import icons
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Step,
  Stack,
  Paper,
  Dialog,
  Select,
  Button,
  Avatar,
  Divider,
  Stepper,
  MenuItem,
  Checkbox,
  StepLabel,
  InputLabel,
  Typography,
  IconButton,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

import { useGetAllEvents } from 'src/api/event';

import MarkdownContent from 'src/components/markdown/MarkdownContent';
import FormProvider, { RHFUpload, RHFTextField, RHFDatePicker } from 'src/components/hook-form';

// Rich text editor for camp resources
const RichTextEditor = ({ value, onChange }) => {
  const [text, setText] = useState(value || '');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isChecked, setIsChecked] = useState(false); // Default to dense preview
  const textAreaRef = React.useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    onChange(e.target.value);
  };

  const saveSelection = () => {
    if (textAreaRef.current) {
      setSelection({
        start: textAreaRef.current.selectionStart,
        end: textAreaRef.current.selectionEnd,
      });
    }
  };

  const insertFormat = (format) => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const { start, end } = selection;
      const selectedText = text.substring(start, end);

      let newText = text;
      let newCursorPos = end;

      switch (format) {
        case 'bold':
          newText = `${text.substring(0, start)}**${selectedText}**${text.substring(end)}`;
          newCursorPos = end + 4;
          break;
        case 'italic':
          newText = `${text.substring(0, start)}_${selectedText}_${text.substring(end)}`;
          newCursorPos = end + 2;
          break;
        case 'link':
          const url = prompt('Enter URL:', 'https://');
          if (url) {
            newText = `${text.substring(0, start)}[${selectedText}](${url})${text.substring(end)}`;
            newCursorPos = end + url.length + 4;
          }
          break;
        case 'list':
          const lines = selectedText ? selectedText.split('\n') : [''];
          const bulletList = lines.map((line) => `- ${line}`).join('\n');
          newText = text.substring(0, start) + bulletList + text.substring(end);
          newCursorPos = start + bulletList.length;
          break;
        case 'numbered':
          const numberedLines = selectedText ? selectedText.split('\n') : [''];
          const numberedList = numberedLines.map((line, i) => `${i + 1}. ${line}`).join('\n');
          newText = text.substring(0, start) + numberedList + text.substring(end);
          newCursorPos = start + numberedList.length;
          break;
        case 'heading':
          newText = `${text.substring(0, start)}## ${selectedText}${text.substring(end)}`;
          newCursorPos = end + 3;
          break;
        default:
          break;
      }

      setText(newText);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <IconButton size="small" onClick={() => insertFormat('bold')} title="Bold">
            <FormatBoldIcon />
          </IconButton>
          <IconButton size="small" onClick={() => insertFormat('italic')} title="Italic">
            <FormatItalicIcon />
          </IconButton>
          <IconButton size="small" onClick={() => insertFormat('link')} title="Insert Link">
            <LinkIcon />
          </IconButton>
          <IconButton size="small" onClick={() => insertFormat('list')} title="Bullet List">
            <FormatListBulletedIcon />
          </IconButton>
          <IconButton size="small" onClick={() => insertFormat('numbered')} title="Numbered List">
            <FormatListNumberedIcon />
          </IconButton>
          <IconButton size="small" onClick={() => insertFormat('heading')} title="Heading">
            <TitleIcon />
          </IconButton>
        </Box>
      </Paper>
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={handleTextChange}
        onSelect={saveSelection}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontFamily: 'inherit',
        }}
      />
      {/* Preview section */}
      {text && (
        <Box mt={1.5}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.2,
              '& p': {
                m: 0,
                mb: 1,
                fontSize: '0.875rem',
                '&:last-child': { mb: 0 },
              },
              '& ul, & ol': {
                m: 0,
                mb: 1,
                pl: 2.5,
                '&:last-child': { mb: 0 },
              },
              '& li': {
                mb: 0.5,
                fontSize: '0.875rem',
                '&:last-child': { mb: 0 },
              },
              '& h2': {
                fontSize: '1rem',
                m: 0,
                mb: 1,
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                }
                sx={{
                  m: 0,
                  alignItems: 'flex-start',
                  '& .MuiCheckbox-root': {
                    pt: 0,
                  },
                }}
              />
              <Box sx={{ flex: 1 }}>
                <MarkdownContent content={text} />
              </Box>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

// All steps for the stepper
const eventSteps = ['Event Information', 'Settings'];
// const campSteps = ['Event Information', 'Camp Resources', 'Settings'];

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
            {options?.map((option) => (
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

// Updated schema to include the new fields
const schema = yup.object().shape({
  eventType: yup.string().required('Event type is required'),
  eventName: yup.string().required('Event name is required'),
  personInCharge: yup.string().required('Person in charge is required'),
  eventDate: yup.date().required('Event date is required'),
  endDate: yup.date().required('End date is required'),
  startTime: yup.date().required('Start time is required'),
  endTime: yup.date().required('End time is required'),
  sst: yup.number().required('SST is required').typeError('SST must be a number'),
  eventLogo: yup.object().nullable(),
  // Camp resources fields - rich text content
  // campResources: yup.array().when('eventType', {
  //   is: 'camp',
  //   then: () =>
  //     yup.array().of(
  //       yup.object().shape({
  //         title: yup.string().required('Title is required'),
  //         content: yup.string().required('Content is required'),
  //       })
  //     ),
  //   otherwise: () => yup.array(),
  // }),
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
      eventType: 'event', // Default event type
      eventName: '',
      personInCharge: '',
      eventDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      themeColor: '',
      sst: '',
      eventLogo: null,
      campResources: [{ title: '', content: '' }], // Default empty camp resource
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

  // Use field array to manage dynamic camp resource fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'campResources',
  });

  const eventType = watch('eventType'); // Watch for eventType changes
  const startTimeValue = watch('startTime'); // Watch for startTime changes

  // Define steps based on event type
  // const steps = eventType === 'camp' ? campSteps : eventSteps;

  const steps = eventSteps;

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
      const startDate = dayjs(eventData.eventDate).format('YYYY-MM-DD');
      const endDate = dayjs(eventData.endDate).format('YYYY-MM-DD');

      const startTime = dayjs(eventData.startTime).format('HH:mm');
      const endTime = dayjs(eventData.endTime).format('HH:mm');

      console.log('Time values:', {
        startTime: `${dayjs(eventData.startTime).format('hh:mm A')} -> ${startTime}`,
        endTime: `${dayjs(eventData.endTime).format('hh:mm A')} -> ${endTime}`,
      });

      const startDateTimeFormatted = `${startDate}T${startTime}`;
      const endDateTimeFormatted = `${endDate}T${endTime}`;

      const formattedData = {
        ...eventData,
        date: startDateTimeFormatted,
        endDate: endDateTimeFormatted,
      };

      // Remove fields not needed in the API
      delete formattedData.startTime;
      delete formattedData.endTime;
      delete formattedData.eventDate;

      // If event type is not camp, remove the campResources field
      // if (formattedData.eventType !== 'camp') {
      //   delete formattedData.campResources;
      // }

      // Prepare FormData for file upload and event data
      const formData = new FormData();
      formData.append('data', JSON.stringify(formattedData));

      // Only append eventLogo if it exists
      if (eventData.eventLogo?.file) {
        formData.append('eventLogo', eventData.eventLogo?.file);
      }

      // Send the request to create the event
      const res = await axiosInstance.post(endpoints.events.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // On success, refresh the data and display success message
      mutate();
      enqueueSnackbar(res?.data?.message || 'Event created successfully', { variant: 'success' });

      handleCancel();
    } catch (error) {
      // Handle errors
      enqueueSnackbar(error?.message, { variant: 'error' });
    }
  });

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

          {/* Event Information Step */}
          {activeStep === 0 && (
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2.5}>
              {/* Event Type Selection */}
              <Stack width={1} spacing={1}>
                <InputLabel required>Event Type</InputLabel>
                <Controller
                  name="eventType"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <Select
                        {...field}
                        displayEmpty
                        MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
                      >
                        <MenuItem value="event">Event</MenuItem>
                        <MenuItem value="camp">Camp</MenuItem>
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Stack>

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
                            ampm
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
                            ampm
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

          {/* Camp Resources Step - Only shown for Camp event type
          {activeStep === 1 && eventType === 'camp' && (
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2.5} width={1}>
              <Typography variant="h6" gutterBottom>
                Camp Resources
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add resources for camp participants. You can use formatting tools to make your
                content more engaging.
              </Typography>

              {fields.map((field, index) => (
                <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2, width: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="600">
                      Resource #{index + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length <= 1}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>

                  <Box mb={2}>
                    <InputLabel required>Title</InputLabel>
                    <RHFTextField
                      name={`campResources.${index}.title`}
                      placeholder="Resource title"
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <InputLabel required>Content</InputLabel>
                    <Controller
                      name={`campResources.${index}.content`}
                      control={control}
                      // eslint-disable-next-line no-shadow
                      render={({ field }) => (
                        <RichTextEditor value={field.value} onChange={field.onChange} />
                      )}
                    />
                    {errors?.campResources?.[index]?.content && (
                      <FormHelperText error>
                        {errors.campResources[index].content.message}
                      </FormHelperText>
                    )}
                  </Box>
                </Paper>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={() => append({ title: '', content: '' })}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Resource
              </Button>
            </Box>
          )} */}

          {/* Settings Step */}
          {
          // activeStep === (eventType === 'camp' ? 2 : 1) && ( //comented out for now since we are not using camp resouces
          activeStep === 1 && (
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2.5}>
              <Stack width={1}>
                <InputLabel>Event Logo</InputLabel>
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
