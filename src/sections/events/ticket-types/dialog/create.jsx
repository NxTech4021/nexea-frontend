/* eslint-disable react/prop-types */
import * as yup from 'yup';
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

import AddOn from '../components/addOn';

// Custom InputLabel with red asterisk
const StyledInputLabel = ({ required, children, ...props }) => (
  <InputLabel
    required={required}
    {...props}
    sx={{
      '& .MuiFormLabel-asterisk': {
        color: 'error.main',
      },
    }}
  >
    {children}
  </InputLabel>
);

StyledInputLabel.propTypes = {
  required: PropTypes.bool,
  children: PropTypes.node,
};

const RenderSelectField = ({ name, control, label, options, required }) => (
  <Stack width={1} spacing={1}>
    <StyledInputLabel required={required}>{label}</StyledInputLabel>
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
            {/* <MenuItem disabled value="">
              <em>Select an option</em>
            </MenuItem> */}
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

const ticketTypes = ['Early Bird', 'Standard', 'After Party'];
const ticketCategories = ['Startup', 'General', 'Speaker', 'VIP'];

const stepper = [
  { label: 'Ticket information', icon: <Iconify icon="f7:tickets-fill" width={25} /> },
  { label: 'Add ons', icon: <Iconify icon="ri:function-add-fill" width={25} /> },
];

// Validation Schema
const validationSchema = [
  // Step 1 - Ticket Information Schema
  yup.object().shape({
    eventId: yup.string().required('Event name is required'),
    type: yup.string().required('Ticket type is required'),
    category: yup.string().when('type', {
      is: (val) => val !== 'After Party',
      then: (s) => s.string().required('Category is required'),
      otherwise: (s) => s.string().notRequired(),
    }),
    title: yup.string().required('Title is required'),
    price: yup.string().required('Price is required'),
    quantity: yup
      .number()
      .required('Quantity is required')
      .positive('Quantity must be a positive number'),
    description: yup.string().required('Description is required'),
    requirement: yup.object().shape({
      minimumTicketPerOrder: yup
        .number()
        .transform((value) => (Number.isNaN(value) ? undefined : value))
        .nullable()
        .integer('Minimum must be an integer')
        .min(1, 'Minimum must be at least 1'),
      maximumTicketPerOrder: yup
        .number()
        .transform((value) => (Number.isNaN(value) ? undefined : value))
        .nullable()
        .integer('Maximum must be an integer')
        .min(1, 'Maximum must be at least 1')
        .test(
          'max-greater-than-min',
          'Maximum must be greater than or equal to minimum',
          function (value) {
            const { minimumTicketPerOrder } = this.parent;
            return !minimumTicketPerOrder || !value || value >= minimumTicketPerOrder;
          }
        ),
    }),
  }),
  // Step 2 - Add Ons Schema (optional)
  yup.object(),
];

const CreateTicketTypeDialog = ({ openDialog, onSubmit, eventsData, onClose }) => {
  const methods = useFormContext();
  const smDown = useResponsive('down', 'sm');
  const [activeStep, setActiveStep] = useState(0);

  const { control, watch, setValue, formState, trigger } = methods;
  const { errors, isValid } = formState;

  const type = watch('type');
  const category = watch('category');
  const eventId = watch('eventId');
  const title = watch('title');
  const price = watch('price');
  const quantity = watch('quantity');
  const description = watch('description');
  const minTickets = watch('requirement.minimumTicketPerOrder');
  const maxTickets = watch('requirement.maximumTicketPerOrder');

  const handleNext = async () => {
    const currentSchema = validationSchema[activeStep];
    const fieldsToValidate = Object.keys(currentSchema.fields);

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Validate min/max ticket numbers
  useEffect(() => {
    if (minTickets && maxTickets && Number(minTickets) > Number(maxTickets)) {
      setValue('requirement.maximumTicketPerOrder', minTickets, { shouldValidate: true });
    }
  }, [minTickets, maxTickets, setValue]);

  useEffect(() => {
    if (type && category) {
      setValue('title', `${category} - ${type}`, { shouldValidate: true });
    }
  }, [type, category, setValue]);

  // Check if required fields for the first step are filled
  const isFirstStepValid = Boolean(
    eventId &&
      type &&
      type !== 'After Party' &&
      category &&
      title &&
      price &&
      quantity &&
      description &&
      !Object.keys(errors).length
  );

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
              {type !== 'After Party' && (
                <RenderSelectField
                  name="category"
                  control={control}
                  label="Category"
                  options={ticketCategories}
                  required
                />
              )}
            </Stack>

            <Stack spacing={1} width={1}>
              <StyledInputLabel required>Title</StyledInputLabel>
              <RHFTextField name="title" placeholder="Ticket Title" />
            </Stack>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)' }}
              width={1}
              gap={1}
            >
              <Stack spacing={1} width={1}>
                <StyledInputLabel required>Price</StyledInputLabel>

                <Controller
                  name="price"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NumericFormat
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
                <StyledInputLabel required>Quantity</StyledInputLabel>

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
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Stack>

              <Stack spacing={1} width={1}>
                <StyledInputLabel>Minimum tickets per order</StyledInputLabel>

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
                      error={!!fieldState.error}
                      helperText={fieldState.error ? fieldState.error.message : ''}
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Stack>

              <Stack spacing={1} width={1}>
                <StyledInputLabel>Maximum tickets per order</StyledInputLabel>

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
                      error={!!fieldState.error}
                      helperText={fieldState.error ? fieldState.error.message : ''}
                      inputProps={{ min: minTickets || 1 }}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Stack spacing={1} width={1}>
              <StyledInputLabel required>Description</StyledInputLabel>

              <RHFTextField
                name="description"
                placeholder="Ticket Description"
                multiline
                rows={4}
              />
            </Stack>
          </Box>
        )}

        {activeStep === 1 && <AddOn />}
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
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ fontWeight: 400 }}
              // disabled={!isFirstStepValid}
            >
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
