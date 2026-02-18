import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Avatar,
  Button,
  Dialog,
  Switch,
  Divider,
  FormLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';

import FormProvider from 'src/components/hook-form';

const EventSettingsDialog = ({ open, onClose, selectedEvent }) => {
  const smUp = useResponsive('up', 'sm');

  const methods = useForm({
    defaultValues: {
      showRemainingTickets: selectedEvent?.showRemainingTickets || false,
    },
  });

  const { control, handleSubmit, setValue } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axiosInstance.patch(`/api/event/${selectedEvent.id}/setting`, data);
      toast.success(`Successfully updated ${res.data.name} Setting`);
      onClose();
    } catch (error) {
      console.log(error);
      toast.error(error?.message || 'Error updating event setting');
    }
  });

  useEffect(() => {
    setValue('showRemainingTickets', selectedEvent?.showRemainingTickets);
  }, [selectedEvent, setValue]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="edit-event-dialog-title"
      aria-describedby="edit-event-dialog-description"
      maxWidth="md"
      fullWidth
      fullScreen={!smUp}
      PaperProps={{
        elevation: 0,
        sx: {
          ...(smUp && {
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }),
          background: (theme) => theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        id="edit-event-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 3,
          px: 3,
        }}
      >
        <Avatar
          alt="Event"
          src={selectedEvent?.eventSetting?.eventLogo || '/logo/nexea.png'}
          sx={{
            width: 48,
            height: 48,
            marginRight: 2,
            border: (theme) => `3px solid ${theme.palette.background.paper}`,
            backgroundColor: selectedEvent?.eventSetting?.bgColor || '#f0f4f8',
            '& img': {
              objectFit: 'contain',
              width: '70%',
              height: '70%',
              margin: 'auto',
            },
          }}
        />
        <Box>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{
              letterSpacing: '-0.2px',
              mb: 0.5,
            }}
          >
            {selectedEvent?.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.85rem',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#34c759',
                display: 'inline-block',
                mr: 1,
              }}
            />
            Edit Event Settings
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent
          sx={{
            p: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <FormControl variant="standard" fullWidth>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormLabel component="legend">Show remaining availability to buyers</FormLabel>

              <Controller
                name="showRemainingTickets"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                      />
                    }
                  />
                )}
              />
            </Stack>
            <FormHelperText>Buyers will see how many tickets are left</FormHelperText>
          </FormControl>

          <Divider sx={{ my: 1.2 }} />

          {/* <RHFTextField name="setting" label="asd" placeholder="SADs" /> */}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton variant="contained" type="submit">
            Save
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default EventSettingsDialog;

EventSettingsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  selectedEvent: PropTypes.any,
};
