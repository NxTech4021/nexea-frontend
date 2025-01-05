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
  FormHelperText,
  FormControl,
} from '@mui/material';
import { types, categories, availabilities } from 'src/_mock/_discountCodes'; 
import RHFDatePicker from 'src/components/hook-form/rhf-datePicker';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';
import RHFTextField from 'src/components/hook-form/rhf-text-field';

// Validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .required('Discount code name is required')
    .test('unique-name', 'Discount code name already exists', async (value) => {
      const response = await fetch('/api/check-discount-code-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: value }),
      });
      const data = await response.json();
      return data.isUnique; // Assuming the API returns { isUnique: true/false }
    }),
  type: yup.string().required('Type is required'),
  value: yup.string().required('Value is required'),
  availability: yup.array().of(yup.string()).required('Availability is required'),
  category: yup.string().required('Category is required'),
  limit: yup.string().required('Limit is required'),
  startDate: yup
    .date()
    .nullable()
    .required('Start Date is required')
    .test('start-before-end', 'Start date must be before end date', function (value) {
      const { endDate } = this.parent;
      return !endDate || !value || dayjs(value).isBefore(dayjs(endDate));
    }),
  endDate: yup
    .date()
    .nullable('End Date is required')
    .required('End Date is required')
    .test('end-after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      return !startDate || !value || dayjs(value).isAfter(dayjs(startDate));
    }),
});

const CreateDiscountCode = ({ discountCode = {}, onCreate, open, onClose }) => {
    console.log(discountCode);
    const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
        id: discountCode?.id || '', 
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
    console.log('Form Data:', data);
    console.log('Validation Errors:', methods.formState.errors);
    const formattedData = {
      ...data,
      startDate: data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : null,
      endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : null,
    };
  
    onCreate(formattedData); 
    onClose(); 
  };
  
  const FormField = ({ label, children }) => (
    <Stack spacing={0.3} sx={{ width: '100%' }}>
      <InputLabel>{label}</InputLabel>
      {children}
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
      <DialogTitle>
        <Typography variant="h4">Create Discount Code</Typography>
        <Typography variant="body2" color="textSecondary">
            Fill out the details to create a new discount code.
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
                    <FormControl fullWidth error={!!fieldState.error}>
                        <Select
                        {...field}
                        displayEmpty
                        >
                        {types.map((type) => (
                            <MenuItem key={type.id} value={type.name}>
                            {type.name}
                            </MenuItem>
                        ))}
                        </Select>
                        {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                        )}
                    </FormControl>
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
                    <FormControl fullWidth error={!!fieldState.error}>
                        <RHFAutocomplete
                        {...field}
                        multiple
                        options={availabilities.map((item) => item.name)}
                        getOptionLabel={(option) => option}
                        isOptionEqualToValue={(option, value) => option === value}
                        value={field.value || []}
                        onChange={(_, newValue) => field.onChange(newValue)}
                        error={!!fieldState.error}
                        renderInput={(params) => (
                            <TextField
                            {...params}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message || ''} 
                            />
                        )}
                        />
                        {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                        )}
                    </FormControl>
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
                        <FormControl fullWidth error={!!fieldState.error}>
                            <Select
                            {...field}
                            displayEmpty
                            >
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.name}>
                                {category.name}
                                </MenuItem>
                                ))}
                            </Select>
                            {fieldState.error && (
                            <FormHelperText>{fieldState.error.message}</FormHelperText>
                            )}
                        </FormControl>
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
                        <>
                            <RHFDatePicker
                            {...field}
                            onChange={(date) => field.onChange(dayjs(date))}
                            error={!!fieldState.error}
                            />
                        </>
                        )}
                    />
                </FormField>
                <FormField label="End Date">
                    <Controller
                        name="endDate"
                        control={control}
                        render={({ field, fieldState }) => (
                        <>
                            <RHFDatePicker
                            {...field}
                            onChange={(date) => field.onChange(dayjs(date))}
                            error={!!fieldState.error}
                            />
                        </>
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
              Create
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
};

CreateDiscountCode.propTypes = {
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
  onCreate: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateDiscountCode;


