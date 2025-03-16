import React from 'react';
import * as yup from 'yup';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
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

import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { mutate } from 'swr';

const defaultValues = {
  name: '',
  price: null,
  description: '',
};

const schema = yup.object().shape({
  name: yup.string().required('Title is required'),
  price: yup.string().required('Price is required'),
});

const CreateAddOnDialog = ({ open, onClose }) => {
  const smDown = useResponsive('down', 'sm');

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, setValue, control, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axiosInstance.post(endpoints.ticketType.addOn.root, data);
      toast.success(res.data.message);
      mutate(endpoints.ticketType.addOn.root);
      reset();
      onClose();
    } catch (error) {
      toast.error(error?.message);
    }
  });

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
            primary="Create Add On Item"
            secondary="You can create and manage ticket add-ons like after-party access or merch for users to select during checkout."
            primaryTypographyProps={{ variant: 'h5' }}
          />
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2}>
            <Stack width={1}>
              <InputLabel required>Title</InputLabel>
              <RHFTextField name="name" placeholder="Title" />
            </Stack>
            <Stack width={1} spacing={1}>
              <InputLabel required>Price</InputLabel>
              <Controller
                name="price"
                control={control}
                render={({ fieldState: { error } }) => (
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

              {/* <RHFTextField name="name" placeholder="Add on name" /> */}
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
            Submit
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default CreateAddOnDialog;

CreateAddOnDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
