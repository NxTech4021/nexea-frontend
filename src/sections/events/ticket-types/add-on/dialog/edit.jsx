import * as yup from 'yup';
import { mutate } from 'swr';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Stack,
  Button,
  Dialog,
  TextField,
  InputLabel,
  DialogTitle,
  ListItemText,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { endpoints, axiosInstance } from 'src/utils/axios';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

const schema = yup.object().shape({
  name: yup.string().required('Title is required'),
  price: yup.string().required('Price is required'),
  quantity: yup.number().required('Quantity is required'),
});

const EditAddOnDialog = ({ open, onClose, item }) => {
  const smDown = useResponsive('down', 'sm');

  const defaultValues = {
    name: item?.name || 'asd',
    price: item?.price || null,
    description: item?.description || '',
    quantity: item.quantity || null,
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, setValue, control, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axiosInstance.patch(`${endpoints.ticketType.addOn.root}/${item.id}`, data);
      toast.success(res.data.message);
      mutate(endpoints.ticketType.addOn.root);
      reset();
      onClose();
    } catch (error) {
      toast.error(error?.message);
    }
  });

  useEffect(() => {
    setValue('name', item.name);
    setValue('description', item.description);
    setValue('price', item.price);
    setValue('quantity', item.quantity);
  }, [item, setValue]);

  return (
    <Dialog
      open={open}
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
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          <ListItemText
            primary="Edit Add On Item"
            secondary="Edit existing add on tickets."
            primaryTypographyProps={{ variant: 'h5' }}
          />
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2}>
            <Stack width={1}>
              <InputLabel required>Title</InputLabel>
              <RHFTextField name="name" placeholder="Title" />
            </Stack>
            <Stack width={1}>
              <InputLabel required>Quantity</InputLabel>
              <RHFTextField
                name="quantity"
                type="number"
                placeholder="Quantity"
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
              />
            </Stack>
            <Stack width={1} spacing={1}>
              <InputLabel required>Price</InputLabel>
              <Controller
                name="price"
                control={control}
                render={({ fieldState: { error } }) => (
                  <NumericFormat
                    value={item.price}
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
          </Stack>
          <Stack width={1} mt={2}>
            <InputLabel>Description</InputLabel>
            <RHFTextField name="description" placeholder="Add on description" multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined" sx={{ fontWeight: 400 }}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" sx={{ fontWeight: 400 }}>
            Save
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default EditAddOnDialog;

EditAddOnDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  item: PropTypes.object,
};
