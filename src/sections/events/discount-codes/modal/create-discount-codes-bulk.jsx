/* eslint-disable react/prop-types */
import dayjs from 'dayjs';
import * as yup from 'yup';
import { mutate } from 'swr';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Table,
  Button,
  Select,
  Dialog,
  Divider,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  InputLabel,
  IconButton,
  Typography,
  FormControl,
  DialogTitle,
  ToggleButton,
  DialogContent,
  DialogActions,
  FormHelperText,
  ToggleButtonGroup,
} from '@mui/material';

import { endpoints, axiosInstance } from 'src/utils/axios';

import { types } from 'src/_mock/_discountCodes';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/rhf-datePicker';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';

const emptyRow = () => ({ id: crypto.randomUUID(), name: '', limit: '' });

const schema = yup.object().shape({
  type: yup.string().required('Discount type is required'),
  availability: yup.array().min(1, 'At least one ticket type is required'),
  expirationDate: yup.mixed().required('Expiration date is required'),
});

const getValueLabel = (discountType) => {
  if (discountType === 'percentage') return ' (%)';
  if (discountType) return ' (RM)';
  return '';
};

const CreateDiscountCodeBulk = ({ open, onClose, ticketTypes }) => {
  const [inputMode, setInputMode] = useState('manual');
  const [rows, setRows] = useState([emptyRow()]);
  const [rowErrors, setRowErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: '',
      availability: [],
      expirationDate: dayjs(),
    },
    mode: 'onChange',
  });

  const { handleSubmit, reset, setValue, watch } = methods;
  const discountType = watch('type');
  const availability = watch('availability');

  const handleModeChange = (_, newMode) => {
    if (newMode) setInputMode(newMode);
  };

  const handleAddRow = () => setRows((prev) => [...prev, emptyRow()]);

  const handleRemoveRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleRowChange = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setRowErrors((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: undefined },
    }));
  };

  const handleAvailabilityValueChange = (ticketTypeId, newValue) => {
    setValue(
      'availability',
      availability.map((item) =>
        item.id === ticketTypeId ? { ...item, value: newValue } : item
      )
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').filter((l) => l.trim());

      const startIndex = lines[0]?.toLowerCase().includes('discount code') ? 1 : 0;

      const parsed = lines
        .slice(startIndex)
        .map((line) => {
          const [name = '', limit = ''] = line.split(',').map((s) => s.trim().replace(/"/g, ''));
          return { id: crypto.randomUUID(), name, limit };
        })
        .filter((r) => r.name);

      if (parsed.length === 0) {
        enqueueSnackbar('No valid rows found in the file', { variant: 'warning' });
        return;
      }

      setRows(parsed);
      setRowErrors({});
      enqueueSnackbar(`${parsed.length} rows loaded from file`, { variant: 'success' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const validateRows = () => {
    const errors = {};
    let valid = true;
    rows.forEach((r) => {
      const rowErr = {};
      if (!r.name.trim()) {
        rowErr.name = 'Required';
        valid = false;
      }
      if (Object.keys(rowErr).length) errors[r.id] = rowErr;
    });
    setRowErrors(errors);
    return valid;
  };

  const validateAvailabilityValues = () => {
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

  const onSubmit = handleSubmit(async (sharedValues) => {
    if (!validateRows()) return;

    const valueError = validateAvailabilityValues();
    if (valueError) {
      enqueueSnackbar(valueError, { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: sharedValues.type,
        availability: sharedValues.availability,
        expirationDate: sharedValues.expirationDate,
        codes: rows.map((r) => ({
          name: r.name.trim(),
          limit: r.limit !== '' ? Number(r.limit) : 0,
        })),
      };

      const res = await axiosInstance.post(endpoints.discount.bulk, payload);
      enqueueSnackbar(res?.data?.message);
      mutate(endpoints.discount.get);
      handleClose();
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error?.message || 'Something went wrong', {
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleClose = () => {
    reset();
    setRows([emptyRow()]);
    setRowErrors({});
    setInputMode('manual');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 1 } }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          <Typography variant="h4">Create Discount Codes In Bulk</Typography>
          <Typography variant="body2" color="textSecondary">
            Set shared fields, then add codes manually or upload a CSV.
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Stack spacing={0.5} width={1}>
                <InputLabel required>Discount Type</InputLabel>
                <FormControl fullWidth error={!!methods.formState.errors.type}>
                  <Select
                    value={watch('type')}
                    onChange={(e) => setValue('type', e.target.value, { shouldValidate: true })}
                    displayEmpty
                    renderValue={(selected) =>
                      types.find((t) => t.id === selected)?.name || 'Select an option'
                    }
                  >
                    <MenuItem disabled value="">
                      <em>Select an option</em>
                    </MenuItem>
                    {types.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {methods.formState.errors.type && (
                    <FormHelperText>{methods.formState.errors.type.message}</FormHelperText>
                  )}
                </FormControl>
              </Stack>

              <Stack spacing={0.5} width={1}>
                <InputLabel required>Expiration Date</InputLabel>
                <RHFDatePicker name="expirationDate" />
              </Stack>
            </Stack>

            <Stack spacing={0.5}>
              <InputLabel required>Availability (Ticket Types)</InputLabel>
              <RHFAutocomplete
                name="availability"
                multiple
                options={[
                  { id: 'all', title: 'Select all', event: { name: '' } },
                  ...(ticketTypes || []).filter((i) => i?.event?.name),
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
                      (ticketTypes || []).map(({ id, title, event: ev }) => ({ id, title, event: ev }))
                    );
                  } else {
                    setValue(
                      'availability',
                      selected.map((s) => availability.find((a) => a.id === s.id) || s)
                    );
                  }
                }}
              />
              {methods.formState.errors.availability && (
                <FormHelperText error>
                  {methods.formState.errors.availability.message}
                </FormHelperText>
              )}
            </Stack>

            {availability.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  {`Discount Value per Ticket Type${getValueLabel(discountType)}`}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  These values are shared across all codes created below.
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
                      onChange={(e) => handleAvailabilityValueChange(item.id, e.target.value)}
                      placeholder="e.g. 750"
                      inputProps={{
                        min: 0,
                        max: discountType === 'percentage' ? 100 : undefined,
                      }}
                      sx={{ width: 140 }}
                    />
                  </Stack>
                ))}
              </Stack>
            )}

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <ToggleButtonGroup
                value={inputMode}
                exclusive
                onChange={handleModeChange}
                size="small"
              >
                <ToggleButton value="manual">Manual Entry</ToggleButton>
                <ToggleButton value="upload">Upload CSV</ToggleButton>
              </ToggleButtonGroup>

              {inputMode === 'upload' && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="solar:upload-bold" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload CSV
                  </Button>
                  <Typography variant="caption" color="textSecondary">
                    Columns: Discount Code, Limit
                  </Typography>
                </Stack>
              )}

              {inputMode === 'manual' && (
                <Button
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleAddRow}
                >
                  Add Row
                </Button>
              )}
            </Stack>

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.neutral' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Discount Code *</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Limit (optional)</TableCell>
                    <TableCell width={48} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.name}
                          onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                          placeholder="e.g. NEXEA2025"
                          error={!!rowErrors[row.id]?.name}
                          helperText={rowErrors[row.id]?.name}
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={row.limit}
                          onChange={(e) => handleRowChange(row.id, 'limit', e.target.value)}
                          placeholder="Unlimited"
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={rows.length === 1}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Typography variant="caption" color="textSecondary">
              {rows.length} code{rows.length !== 1 ? 's' : ''} ready to create
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton variant="contained" type="submit" loading={isSubmitting}>
            Create {rows.length} Code{rows.length !== 1 ? 's' : ''}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default CreateDiscountCodeBulk;
