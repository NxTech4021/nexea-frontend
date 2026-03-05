import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { axiosInstance } from 'src/utils/axios';

import Iconify from 'src/components/iconify';

const MotionButton = m(Button);
const MotionTypography = m(Typography);
const MotionBox = m(Box);

const MetaPixelSetting = ({ open, onClose, selectedEvent }) => {
  const [pixelId, setPixelId] = useState(selectedEvent?.metaPixelId || '');
  const [accessToken, setAccessToken] = useState(selectedEvent?.metaAccessToken || '');
  const [conversionName, setConversionName] = useState(selectedEvent?.conversionName || '');
  const [testCode, setTestCode] = useState('');

  const isCopy = useBoolean();
  const isSubmitting = useBoolean();

  const copyPixelUrl = () => {
    isCopy.onTrue();

    setTimeout(() => {
      isCopy.onFalse();
    }, 2000);
  };

  const onSubmit = async () => {
    isSubmitting.onTrue();
    try {
      const res = await axiosInstance.patch(`/api/event/configure-meta/${selectedEvent.id}`, {
        metaPixelId: pixelId,
        accessToken,
        conversionName,
      });

      toast.success(res?.data?.message);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      isSubmitting.onFalse();
    }
  };

  const handleTestEvent = async () => {
    try {
      const res = await axiosInstance.post(`/api/event/test-meta-pixel/${selectedEvent.id}`, {
        testCode,
      });

      toast.success(res?.data?.message);
    } catch (error) {
      toast.error('Test Error');
    }
  };

  const toCamelCase = (value) =>
    value
      .replace(/[^a-zA-Z0-9 ]/g, '') // remove special chars
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0.8,
        },
      }}
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 'semibold' }}>
            Meta Pixel Configuration - {selectedEvent.name}
          </Typography>

          {/* <MotionButton
            animate={{ x: [-100, 0], opacity: [0, 1] }}
            transition={{ type: 'spring' }}
            size="medium"
            variant="outlined"
            sx={{
              borderRadius: 0.5,
              fontWeight: 'medium',
              fontSize: 12,
              color: (theme) => theme.palette.grey[600],
              width: 130,
              height: 30,
              overflow: 'hidden',
            }}
            onClick={copyPixelUrl}
            disabled={isCopy.value}
          >
            <AnimatePresence mode="wait">
              {!isCopy.value ? (
                <MotionTypography
                  key="copy"
                  variant="caption"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Copy Event Url
                </MotionTypography>
              ) : (
                <MotionBox
                  key="icon"
                  variant="caption"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  sx={{
                    width: 1,
                    height: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Iconify icon="charm:tick" width={15} />
                </MotionBox>
              )}
            </AnimatePresence>
          </MotionButton> */}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack mt={1} gap={2}>
          <TextField
            value={pixelId}
            label="Meta Pixel ID"
            size="small"
            placeholder="Eg. 872829289381"
            fullWidth
            onChange={(e) => setPixelId(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  borderRadius: 0.5,
                },
              },
              inputLabel: {
                sx: {
                  fontSize: 13,
                },
              },
            }}
          />
          <TextField
            value={accessToken}
            label="Access Token"
            size="small"
            placeholder="Access Token provided by Meta"
            fullWidth
            rows={3}
            multiline
            onChange={(e) => setAccessToken(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  borderRadius: 0.5,
                },
              },
              inputLabel: {
                sx: {
                  fontSize: 13,
                },
              },
            }}
          />
          <TextField
            value={conversionName}
            label="Conversion Name"
            size="small"
            placeholder="Custom conversion name in camelCase. Eg. entrepreneurSummit, epCamp"
            fullWidth
            onChange={(e) => setConversionName(toCamelCase(e.target.value))}
            slotProps={{
              input: {
                sx: {
                  borderRadius: 0.5,
                },
              },
              inputLabel: {
                sx: {
                  fontSize: 13,
                },
              },
            }}
            helperText="This conversion name will appear as custom event name in Meta. Default is 'Purchase'"
          />
          <Stack direction="row" alignItems="start" gap={2}>
            <TextField
              value={testCode}
              label="Test Code"
              size="small"
              placeholder="Test Code provided by Meta for testing event trigger"
              fullWidth
              onChange={(e) => setTestCode(e.target.value)}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: 0.5,
                  },
                },
                inputLabel: {
                  sx: {
                    fontSize: 13,
                  },
                },
              }}
              helperText="Only for testing purpose"
            />
            <Button
              size="small"
              variant="outlined"
              sx={{ borderRadius: 0.5, fontSize: 12 }}
              onClick={handleTestEvent}
            >
              Test
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button size="small" variant="outlined" sx={{ borderRadius: 0.5 }} onClick={onClose}>
          Close
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          sx={{ borderRadius: 0.5 }}
          disabled={!pixelId || !accessToken}
          onClick={onSubmit}
          loading={isSubmitting.value}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default MetaPixelSetting;

MetaPixelSetting.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  selectedEvent: PropTypes.object,
};
