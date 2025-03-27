/* eslint-disable react/prop-types */
import dayjs from 'dayjs';
import React from 'react';
import * as yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Select,
  Dialog,
  MenuItem,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { types } from 'src/_mock/_discountCodes';

import FormProvider from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field';
import RHFDatePicker from 'src/components/hook-form/rhf-datePicker';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';

const FormField = ({ label, children, required = false }) => (
  <Stack spacing={0.3} sx={{ width: '100%' }}>
    <InputLabel required={required}>{label}</InputLabel>
    {children}
  </Stack>
);

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

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.element,
};

// Validation schema

const CreateDiscountCode = ({ discountCode = {}, open, onClose, ticketTypes }) => {
  const schema = yup.object().shape({
    name: yup.string().required('Discount code name is required'),
    type: yup.string().required('Type is required'),
    value: yup
      .number()
      .required('Value is required')
      .when('type', {
        is: (val) => val === 'percentage',
        then: (s) =>
          s
            .required('Value is required')
            .max(100, 'Percentage discount cannot exceed 100')
            .min(0, 'Percentage discount cannot be negative'),
        otherwise: (s) =>
          s.required('Value is required').min(0, 'Discount value cannot be negative'),
      }),
    availability: yup.array().min(1, 'At least one availability is required.'),
    limit: yup.number().min(0, 'Limit cannot be negative'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: discountCode?.id || '',
      name: discountCode?.code || '',
      type: discountCode?.type || '',
      value: discountCode?.value || null,
      availability: discountCode?.ticketType || [],
      limit: discountCode?.limit || 0,
      expirationDate: dayjs(discountCode?.expirationDate) || null,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { control, handleSubmit, reset, isSubmitting, watch, setValue } = methods;

  const discountType = watch('type');

  // const testDiscountValue = useCallback(
  //   (val) => {
  //     if (discountType === 'percentage' && val > 100) {
  //       return false;
  //     }
  //     return true;
  //   },
  //   [discountType]
  // );

  const onSubmit = handleSubmit(async (value) => {
    try {
      const res = await (!discountCode.id
        ? axiosInstance.post(endpoints.discount.create, value)
        : axiosInstance.patch(endpoints.discount.update, value));

      enqueueSnackbar(res?.data?.message);
      mutate(endpoints.discount.get);
      onClose();
      reset();
    } catch (error) {
      enqueueSnackbar(error?.message || error?.error, {
        variant: 'error',
      });
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 1 } }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          <Typography variant="h4">{discountCode.id ? 'Edit' : 'Create'} Discount Code</Typography>
          <Typography variant="body2" color="textSecondary">
            {discountCode.id
              ? 'Update the details of your discount code.'
              : 'Fill out the details to create a new discount code.'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <FormField label="Discount Code" required>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <RHFTextField
                    {...field}
                    placeholder="Enter discount code"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || 'Eg: BENXNEXEA123'}
                  />
                )}
              />
            </FormField>

            <Stack direction="row" spacing={2}>
              <RenderSelectField
                name="type"
                control={control}
                label="Discount Type"
                options={types.map((type) => ({ id: type.id, name: type.name }))}
                required
              />

              <FormField label="Discount Value" required>
                <RHFTextField name="value" type="number" fullWidth helperText="Eg: 100" />
              </FormField>
            </Stack>

            <FormField label="Availability" required>
              <RHFAutocomplete
                name="availability"
                multiple
                options={[{ id: 'all', title: 'Select all', event: { name: '' } }, ...ticketTypes]}
                getOptionLabel={(option) =>
                  option.id === 'all' ? 'Select all' : `${option.title} ( ${option.event.name} )`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disableCloseOnSelect
                placeholder="Select ticket types"
                onChange={(event, selected) => {
                  if (selected.some((item) => item.id === 'all')) {
                    setValue(
                      'availability',
                      ticketTypes.map(({ id, title, event }) => ({ id, title, event })) // Select all except "Select all"
                    );
                  } else {
                    setValue('availability', selected);
                  }
                }}
              />
            </FormField>

            <FormField label="Limit">
              <RHFTextField
                name="limit"
                type="number"
                placeholder="Unlimited"
                helperText="(optional) How many times this discount code can be used before it is void, e.g. 100"
                fullWidth
              />
            </FormField>

            <FormField label="Expiration Date" required>
              <RHFDatePicker name="expirationDate" />
            </FormField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton variant="contained" type="submit" loading={isSubmitting}>
            {discountCode.id ? 'Save' : 'Create'}
          </LoadingButton>
        </DialogActions>
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
    codeLimit: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  onCreate: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateDiscountCode;
