import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  ListItemText,
  Stack,
  InputLabel,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

const defaultValues = {
  name: '',
  price: null,
  description: '',
};

const CreateAddOnDialog = ({ open, onClose }) => {
  const smDown = useResponsive('down', 'sm');

  const methods = useForm({
    defaultValues,
  });

  const { handleSubmit } = methods;

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
      <FormProvider methods={methods}>
        <DialogTitle>
          <ListItemText
            primary="Create Add On Item"
            secondary="Admins can create and manage ticket add-ons like after-party access or merch for users to select during checkout."
            primaryTypographyProps={{ variant: 'h5' }}
          />
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2}>
            <Stack width={1}>
              <InputLabel required>Name</InputLabel>
              <RHFTextField name="name" placeholder="Add on name" />
            </Stack>
            <Stack width={1}>
              <InputLabel required>Price</InputLabel>
              <RHFTextField name="name" placeholder="Add on name" />
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
          <Button variant="contained" sx={{ fontWeight: 400 }}>
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
