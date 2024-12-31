import React from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Divider,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
} from '@mui/material';
import { types, categories, availabilities } from 'src/_mock/_discountCodes'; 
import RHFDatePicker from 'src/components/hook-form/rhf-datePicker';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';
import RHFTextField from 'src/components/hook-form/rhf-text-field';

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required('Discount code name is required'),
  type: yup.string().required('Type is required'),
  value: yup.string().required('Value is required'),
  availability: yup.array().of(yup.string()).required('Availability is required'),
  category: yup.string().required('Category is required'),
  limit: yup.string().required('Limit is required'),
  startDate: yup
    .date()
    .nullable()
    .test('start-before-end', 'Start date must be before end date', function (value) {
      const { endDate } = this.parent;
      return !endDate || !value || dayjs(value).isBefore(dayjs(endDate));
    }),
  endDate: yup
    .date()
    .nullable()
    .test('end-after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      return !startDate || !value || dayjs(value).isAfter(dayjs(startDate));
    }),
});

const EditDiscountCode = ({ discountCode = {}, onSave, open, onClose }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: discountCode?.id || '', // Keep empty for new discount codes
      name: discountCode?.codeName || '',
      type: discountCode?.codeType || '',
      value: discountCode?.codeValue || '',
      availability: discountCode?.codeAvailability || [],
      category: discountCode?.codeCategory || '',
      limit: discountCode?.codeLimit || '',
      startDate: discountCode?.startDate ? dayjs(discountCode.startDate) : null,
      endDate: discountCode?.endDate ? dayjs(discountCode.endDate) : null,
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

  // Simplified FormField component
  const FormField = ({ label, children }) => (
    <Stack spacing={0.3} sx={{ width: '100%' }}>
      <InputLabel>{label}</InputLabel>
      {children}
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
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
                <FormField label="Category">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Select {...field} fullWidth error={!!fieldState.error}>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.name}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormField>
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
    codeCategory: PropTypes.string,
    codeLimit: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditDiscountCode;
