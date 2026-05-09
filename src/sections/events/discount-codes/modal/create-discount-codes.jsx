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
  FormControl,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { endpoints, axiosInstance } from 'src/utils/axios';

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

const getValueLabel = (discountType) => {
  if (discountType === 'percentage') return ' (%)';
  if (discountType) return ' (RM)';
  return '';
};

const CreateDiscountCode = ({ discountCode = {}, open, onClose, ticketTypes }) => {
  const buildDefaultAvailability = () => {
    if (!discountCode?.discountValues?.length) return discountCode?.ticketType || [];
    return discountCode.discountValues.map((dv) => ({
      id: dv.ticketType.id,
      title: dv.ticketType.title,
      event: dv.ticketType.event,
      value: dv.value,
    }));
  };

  const schema = yup.object().shape({
    name: yup.string().required('Discount code name is required'),
    type: yup.string().required('Type is required'),
    availability: yup.array().min(1, 'At least one availability is required.'),
    limit: yup.number().min(0, 'Limit cannot be negative'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: discountCode?.id || '',
      name: discountCode?.code || '',
      type: discountCode?.type || '',
      availability: buildDefaultAvailability(),
      limit: discountCode?.limit || 0,
      expirationDate: dayjs(discountCode?.expirationDate) || null,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { control, handleSubmit, reset, watch, setValue } = methods;

  const discountType = watch('type');
  const availability = watch('availability');

  const handleValueChange = (ticketTypeId, newValue) => {
    setValue(
      'availability',
      availability.map((item) =>
        item.id === ticketTypeId ? { ...item, value: newValue } : item
      )
    );
  };

  const validateValues = () => {
    if (!availability.length) return 'At least one ticket type is required';

    const missingValue = availability.find(
      (item) => item.value === undefined || item.value === null || item.value === ''
    );
    if (missingValue) return `Enter a discount value for "${missingValue.title}"`;

    const negativeValue = availability.find((item) => Number(item.value) < 0);
    if (negativeValue) return `Discount value cannot be negative for "${negativeValue.title}"`;

    if (discountType === 'percentage') {
      const exceeds = availability.find((item) => Number(item.value) > 100);
      if (exceeds) return `Percentage cannot exceed 100 for "${exceeds.title}"`;
    }

    return null;
  };

  const onSubmit = handleSubmit(async (formValue) => {
    const valueError = validateValues();
    if (valueError) {
      enqueueSnackbar(valueError, { variant: 'error' });
      return;
    }

    try {
      const res = await (!discountCode.id
        ? axiosInstance.post(endpoints.discount.create, formValue)
        : axiosInstance.patch(endpoints.discount.update, formValue));

      enqueueSnackbar(res?.data?.message);
      mutate(endpoints.discount.get);
      onClose();
      reset();
    } catch (error) {
      enqueueSnackbar(error?.message || error?.error, { variant: 'error' });
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

            <RenderSelectField
              name="type"
              control={control}
              label="Discount Type"
              options={types.map((type) => ({ id: type.id, name: type.name }))}
              required
            />

            <FormField label="Availability" required>
              <RHFAutocomplete
                name="availability"
                multiple
                options={[
                  { id: 'all', title: 'Select all', event: { name: '' } },
                  ...ticketTypes.filter((i) => i?.event?.name),
                ]}
                getOptionLabel={(option) =>
                  option.id === 'all' ? 'Select all' : `${option.title} ( ${option?.event?.name} )`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disableCloseOnSelect
                placeholder="Select ticket types"
                onChange={(_e, selected) => {
                  if (selected.some((item) => item.id === 'all')) {
                    setValue(
                      'availability',
                      ticketTypes.map(({ id, title, event: ev }) => ({ id, title, event: ev }))
                    );
                  } else {
                    setValue(
                      'availability',
                      selected.map((s) => availability.find((a) => a.id === s.id) || s)
                    );
                  }
                }}
              />
            </FormField>

            {availability.length > 0 && (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    {`Discount Value per Ticket Type${getValueLabel(discountType)}`}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Set a different discount value for each selected ticket type.
                  </Typography>
                  {availability.map((item) => (
                    <Stack key={item.id} direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{item.title}</Typography>
                        {item.event?.name && (
                          <Typography variant="caption" color="textSecondary">
                            {item.event.name}
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        size="small"
                        type="number"
                        value={item.value ?? ''}
                        onChange={(e) => handleValueChange(item.id, e.target.value)}
                        placeholder="e.g. 100"
                        inputProps={{
                          min: 0,
                          max: discountType === 'percentage' ? 100 : undefined,
                        }}
                        sx={{ width: 140 }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </>
            )}

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
          <LoadingButton variant="contained" type="submit">
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
    code: PropTypes.string,
    type: PropTypes.string,
    discountValues: PropTypes.array,
    ticketType: PropTypes.array,
    limit: PropTypes.number,
    expirationDate: PropTypes.string,
  }),
  onCreate: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ticketTypes: PropTypes.array,
};

export default CreateDiscountCode;
