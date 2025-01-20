/* eslint-disable react/prop-types */
import React from 'react';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import {
  Box,
  Stack,
  Button,
  Select,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { types, availabilities } from 'src/_mock/_discountCodes';

import RHFTextField from 'src/components/hook-form/rhf-text-field';
import RHFDatePicker from 'src/components/hook-form/rhf-datePicker';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';

// Simplified FormField component
const FormField = ({ label, children, required = false }) => (
  <Stack spacing={0.3} sx={{ width: '100%' }}>
    <InputLabel required={required}>{label}</InputLabel>
    {children}
  </Stack>
);

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.element,
};

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required('Discount code name is required'),
  type: yup.string().required('Type is required'),
  value: yup.number().required('Value is required'),
  availability: yup.array().min(1, 'At least one availability is required.'),
  limit: yup.number(),
});

const EditDiscountCode = ({ discountCode = {}, onSave, open, onClose }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: discountCode?.id || '',
      name: discountCode?.codeName || '',
      type: discountCode?.codeType || '',
      value: discountCode?.codeValue || null,
      availability: discountCode?.codeAvailability || [],
      limit: discountCode?.codeLimit || 0,
      expirationDate: discountCode?.startDate ? dayjs(discountCode.startDate) : null,
    },
    mode: 'onBlur',
  });

  const { control, handleSubmit } = methods;

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      startDate: data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : null,
      endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : null,
    };

    onSave(formattedData); // Save the new or updated discount code
    onClose(); // Close the dialog
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 1 } }}
    >
      <DialogTitle>
        <Typography variant="h4">{discountCode.id ? 'Edit' : 'Create'} Discount Code</Typography>
        <Typography variant="body2" color="textSecondary">
          {discountCode.id
            ? 'Update the details of your discount code.'
            : 'Fill out the details to create a new discount code.'}
        </Typography>
      </DialogTitle>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <DialogContent>
            <Stack spacing={2}>
              {/* Name Field */}
              <FormField label="Discount Code Name">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <RHFTextField
                      {...field}
                      placeholder="Enter discount code name"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </FormField>

              {/* Type and Value Fields */}
              <Stack direction="row" spacing={2}>
                <FormField label="Type">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Select {...field} fullWidth error={!!fieldState.error}>
                        {types.map((type) => (
                          <MenuItem key={type.id} value={type.name}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="Value">
                  <Controller
                    name="value"
                    control={control}
                    render={({ field, fieldState }) => (
                      <RHFTextField
                        {...field}
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </FormField>
              </Stack>

              {/* Availability */}
              <FormField label="Availability">
                <Controller
                  name="availability"
                  control={control}
                  render={({ field, fieldState }) => (
                    <RHFAutocomplete
                      {...field}
                      multiple
                      options={availabilities.map((item) => item.name)}
                      getOptionLabel={(option) => option}
                      isOptionEqualToValue={(option, value) => option === value}
                      value={field.value || []}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </FormField>

              {/* Category and Limit */}
              <Stack direction="row" spacing={2}>
                <FormField label="Limit">
                  <Controller
                    name="limit"
                    control={control}
                    render={({ field, fieldState }) => (
                      <RHFTextField
                        {...field}
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </FormField>
              </Stack>

              {/* Start and End Dates */}
              <Stack direction="row" spacing={2}>
                <FormField label="Start Date">
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <RHFDatePicker
                        {...field}
                        onChange={(date) => field.onChange(dayjs(date))}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </FormField>
                <FormField label="End Date">
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <RHFDatePicker
                        {...field}
                        onChange={(date) => field.onChange(dayjs(date))}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </FormField>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              {discountCode.id ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
};

EditDiscountCode.propTypes = {
  discountCode: PropTypes.shape({
    id: PropTypes.string,
    codeName: PropTypes.string,
    codeType: PropTypes.string,
    codeValue: PropTypes.string,
    codeAvailability: PropTypes.array,
    codeLimit: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditDiscountCode;
