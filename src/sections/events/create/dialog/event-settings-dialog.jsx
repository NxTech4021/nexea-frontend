import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Alert,
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

import { axiosInstance } from 'src/utils/axios';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

const EventSettingsDialog = ({ open, onClose, selectedEvent }) => {
  const smUp = useResponsive('up', 'sm');

  const methods = useForm({
    defaultValues: {
      showRemainingTickets: selectedEvent?.showRemainingTickets || false,
      customHtml: selectedEvent?.eventSetting?.customHtml || '',
    },
  });

  const { control, handleSubmit, setValue, watch } = methods;
  const customHtmlValue = watch('customHtml');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axiosInstance.patch(`/api/event/${selectedEvent.id}/setting`, data);
      toast.success(`Successfully updated ${res.data.name} Setting`);
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Error updating event setting');
    }
  });

  useEffect(() => {
    setValue('showRemainingTickets', selectedEvent?.showRemainingTickets);
    setValue('customHtml', selectedEvent?.eventSetting?.customHtml || '');
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

          <FormControl variant="standard" fullWidth sx={{ mt: 2 }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Custom Notice (HTML)
            </FormLabel>

            {selectedEvent?.eventSetting?.customHtml &&
              customHtmlValue === selectedEvent.eventSetting.customHtml && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight="600">
                    Current Setting:
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      '& a': { color: 'primary.main' },
                      '& p': { m: 0 },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(selectedEvent.eventSetting.customHtml),
                    }}
                  />
                </Alert>
              )}

            <RHFTextField
              name="customHtml"
              placeholder="<p>Dress code: Business casual</p>&#10;<a href='https://...'>Venue Map</a>"
              multiline
              rows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                },
              }}
            />
            <FormHelperText>
              Add custom HTML to display in the buyer form (e.g., links, notices)
            </FormHelperText>

            {customHtmlValue && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  Preview:
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'divider',
                    backgroundColor: 'action.hover',
                    '& a': { color: 'primary.main', textDecoration: 'underline' },
                    '& p': { m: 0, fontSize: '0.85rem' },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(customHtmlValue),
                  }}
                />
              </Box>
            )}
          </FormControl>
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
