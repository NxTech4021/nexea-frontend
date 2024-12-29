/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  Select,
  Button,
  MenuItem,
  InputLabel,
  DialogTitle,
  FormControl,
  ListItemText,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import FormProvider from 'src/components/hook-form';

const RenderSelectField = ({ name, control, label, options, required, placeholder }) => (
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
            renderValue={(selected) => selected || 'Select an option'}
          >
            <MenuItem disabled value="">
              <em>Select an option</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.id || option} value={option.name || option}>
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

const EventTicketCreateDialog = ({ open, onClose, event }) => {
  const methods = useForm({
    defaultValues: {
      event: event?.id || '',
      type: '',
      category: '',
      price: 0,
      quantity: 0,
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '-webkit-fill-available',
          borderRadius: 1,
          bgcolor: (theme) => theme.palette.background.default,
        },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          <ListItemText
            primary="Create Ticket Type"
            secondary="Easily set up your ticket type now!"
            primaryTypographyProps={{ variant: 'h5' }}
          />
        </DialogTitle>
        {/* <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
            <RenderSelectField name="eventName" control={control} label="Event Name" required />

            <RenderSelectField
              name="type"
              control={control}
              label="Type"
              // options={ticketTypes}
              required
            />

            <RenderSelectField
              name="category"
              control={control}
              label="Category"
              // options={ticketCategories}
              required
            />

            <Stack spacing={1} width={1}>
              <InputLabel required>Price</InputLabel>

              <Controller
                name="price"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    placeholder="Price (RM)"
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
              <InputLabel required>Quantity</InputLabel>

              <Controller
                name="quantity"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
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
          </Box>
        </DialogContent> */}
        <DialogActions>
          <Button variant="outlined" sx={{ fontWeight: 400 }}>
            Cancel
          </Button>
          <LoadingButton onClick={onSubmit} variant="contained" sx={{ fontWeight: 400 }}>
            Submit
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default EventTicketCreateDialog;

EventTicketCreateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  event: PropTypes.object,
};
