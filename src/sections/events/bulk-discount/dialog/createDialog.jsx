import * as Yup from 'yup';
import { mutate } from 'swr';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  Button,
  MenuItem,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';

import { endpoints, axiosInstance } from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

const schema = Yup.object().shape({
  eventId: Yup.string()
    .notOneOf(['Select Event'], 'Event is required')
    .required('Event is required'),
  ticketIds: Yup.array().min(1, 'Ticket is required').required('Ticket is required'),
  minQuantity: Yup.number()
    .min(1, 'Miniumum quantity is 1')
    .required('Minimum Quantity is required'),
  discountPercentage: Yup.number()
    .min(1, 'Discount Percentage is required')
    .max(100)
    .required('Discount Percentage is required'),
});

const CreateDialog = ({ open, close, data: events, tickets }) => {
  const activeEvents = useMemo(() => events?.filter((i) => i.status === 'ACTIVE'), [events]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      eventId: 'Select Event',
      ticketIds: [],
      minQuantity: 1,
      discountPercentage: 1,
    },
  });

  const {
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const eventId = watch('eventId');

  const filteredData = useMemo(
    () => tickets.filter((item) => item.eventId === eventId),
    [eventId, tickets]
  );

  const onSubmit = handleSubmit(async (val) => {
    try {
      const res = await axiosInstance.post(endpoints.bulkDiscount.create, val);
      mutate(endpoints.bulkDiscount.get);
      toast.success(res?.data?.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    } finally {
      reset();
      close();
    }
  });

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 1 } }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="bxs:discount" width={30} />
          <Typography variant="subtitle1">Create Bulk Discount</Typography>
        </Stack>
      </DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={1}>
            <RHFSelect name="eventId" size="small">
              <MenuItem disabled value="Select Event">
                Select Event
              </MenuItem>
              {activeEvents.map((event) => (
                <MenuItem key={event.id} value={event?.id}>
                  {event?.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFAutocomplete
              multiple
              disabled={!eventId}
              placeholder="Select Tickets"
              name="ticketIds"
              options={filteredData || []}
              getOptionLabel={(option) => option.title}
              getOptionKey={(option) => option.id}
              freeSolo
              size="small"
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Label>{option.title}</Label>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disableCloseOnSelect
            />

            <RHFTextField
              name="minQuantity"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              size="small"
              placeholder="Minimum Quantity"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />

            <RHFTextField
              name="discountPercentage"
              type="number"
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              size="small"
              placeholder="Discount Percentage"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Iconify icon="fa-solid:percentage" width={16} sx={{ color: 'black' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            sx={{ borderRadius: 0.5 }}
            onClick={() => {
              reset();
              close();
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            sx={{ borderRadius: 0.5 }}
            type="submit"
            loading={isSubmitting}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default CreateDialog;

CreateDialog.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  data: PropTypes.array,
  tickets: PropTypes.array,
};
