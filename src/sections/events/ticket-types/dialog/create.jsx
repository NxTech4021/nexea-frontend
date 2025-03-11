/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Step,
  Stack,
  Button,
  Dialog,
  Select,
  Stepper,
  MenuItem,
  TextField,
  StepLabel,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  ListItemText,
  DialogActions,
  DialogContent,
  FormHelperText,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';

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
            renderValue={(selected) =>
              options.find((item) => item.id === selected)?.name || selected || 'Select an option'
            }
          >
            <MenuItem disabled value="">
              <em>Select an option</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option?.id || option} value={option?.id || option}>
                {option.name || option}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  </Stack>
);

const ticketTypes = ['Early Bird', 'Standard'];
const ticketCategories = ['Startup', 'General', 'Speaker', 'VIP'];

const stepper = [
  { label: 'Ticket information', icon: <Iconify icon="f7:tickets-fill" width={25} /> },
  { label: 'Add ons', icon: <Iconify icon="ri:function-add-fill" width={25} /> },
];

const CreateTicketTypeDialog = ({ openDialog, onSubmit, eventsData, onClose }) => {
  const methods = useFormContext();
  const smDown = useResponsive('down', 'sm');
  const [activeStep, setActiveStep] = useState(0);

  const { control, watch, setValue } = methods;

  const type = watch('type');
  const category = watch('category');

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setActiveStep((prev) => prev - 1);
  };

  useEffect(() => {
    if (type && category) {
      setValue('title', `${category} - ${type}`, { shouldValidate: true });
    }
  }, [type, category, setValue]);

  return (
    <Dialog
      open={openDialog}
      fullScreen={smDown}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          width: '-webkit-fill-available',
          borderRadius: 1,
          scrollbarWidth: 'none',
        },
      }}
    >
      <DialogTitle>
        <ListItemText
          primary="Create Ticket Type"
          secondary="Easily set up your ticket type now!"
          primaryTypographyProps={{ variant: 'h5' }}
        />
      </DialogTitle>

      <Stepper alternativeLabel activeStep={activeStep} sx={{ mb: 2 }}>
        {stepper.map((item, index) => {
          const labelProps = {};

          if (index === 1) {
            labelProps.optional = <Typography variant="caption">Optional</Typography>;
          }
          return (
            <Step key={item.label}>
              <StepLabel icon={item.icon} {...labelProps}>
                {item.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <DialogContent sx={{ scrollbarWidth: 'none' }}>
        {activeStep === 0 && (
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
            <Stack width={1} direction="row" spacing={1}>
              <RenderSelectField
                name="eventId"
                control={control}
                label="Event Name"
                options={eventsData.events.map((event) => ({ id: event.id, name: event.name }))}
                required
              />
            </Stack>
            <Stack direction="row" justifyContent="stretch" gap={1} width={1}>
              <RenderSelectField
                name="type"
                control={control}
                label="Type"
                options={ticketTypes}
                required
              />
              <RenderSelectField
                name="category"
                control={control}
                label="Category"
                options={ticketCategories}
                required
              />
            </Stack>

            <Stack spacing={1} width={1}>
              <InputLabel required>Title</InputLabel>
              <RHFTextField name="title" placeholder="Ticket Title" />
            </Stack>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)' }}
              width={1}
              gap={1}
            >
              <Stack spacing={1} width={1}>
                <InputLabel required>Price</InputLabel>

                <Controller
                  name="price"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NumericFormat
                      // {...field}
                      customInput={TextField}
                      thousandSeparator
                      prefix="RM "
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      onValueChange={(items) =>
                        setValue('price', items.value, { shouldValidate: true })
                      }
                      placeholder="Price (RM)"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : ''}
                    />
                  )}
                />
              </Stack>

              <Stack spacing={1} width={1}>
                <InputLabel required>Quantity</InputLabel>

                <Controller
                  name="quantity"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Quantity"
                      variant="outlined"
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error ? fieldState.error.message : ''}
                    />
                  )}
                />
              </Stack>

              <Stack spacing={1} width={1}>
                <InputLabel required={false}>Minimum tickets per order</InputLabel>

                <Controller
                  name="requirement.minimumTicketPerOrder"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="No minimum"
                      variant="outlined"
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error ? fieldState.error.message : ''}
                    />
                  )}
                />
              </Stack>

              <Stack spacing={1} width={1}>
                <InputLabel required={false}>Maximum tickets per order</InputLabel>

                <Controller
                  name="requirement.maximumTicketPerOrder"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="No maximum"
                      variant="outlined"
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error ? fieldState.error.message : ''}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Stack spacing={1} width={1}>
              <InputLabel required>Description</InputLabel>

              <RHFTextField
                name="description"
                placeholder="Ticket Description"
                multiline
                rows={4}
              />
            </Stack>
          </Box>
        )}

        {activeStep === 1 && <Typography>Add ons</Typography>}
      </DialogContent>

      <DialogActions>
        {activeStep === stepper.length - 1 ? (
          <>
            <Button variant="outlined" onClick={handlePrev} sx={{ fontWeight: 400 }}>
              Back
            </Button>
            <LoadingButton onClick={onSubmit} variant="contained" sx={{ fontWeight: 400 }}>
              Submit
            </LoadingButton>
          </>
        ) : (
          <>
            <Button variant="outlined" onClick={onClose} sx={{ fontWeight: 400 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleNext} sx={{ fontWeight: 400 }}>
              Next
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicketTypeDialog;

CreateTicketTypeDialog.propTypes = {
  openDialog: PropTypes.bool,
  onSubmit: PropTypes.func,
  eventsData: PropTypes.object,
  onClose: PropTypes.func,
};
