import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
} from '@mui/material';

import { axiosInstance } from 'src/utils/axios';

const QBOSettingsDialog = ({ open, onClose }) => {
  const [services, setServices] = useState(null);
  const [taxRates, setTaxRates] = useState(null);
  const [taxCodes, setTaxCodes] = useState(null);

  const [selectedService, setSelectedService] = useState(null);

  const [loading, setLoading] = useState({
    isServiceLoading: false,
    isTaxCodesLoading: false,
    isTaxRefsLoading: false,
  });

  const getListOfServices = async () => {
    setLoading((prev) => ({ ...prev, isServiceLoading: true }));
    try {
      const res = await axiosInstance.get(`/api/qbo/services`);
      console.log(res.data);

      setServices(res?.data);
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setLoading((prev) => ({ ...prev, isServiceLoading: false }));
    }
  };

  const getListOfTaxCodes = async () => {
    setLoading((prev) => ({ ...prev, isTaxRefsLoading: true }));
    try {
      const res = await axiosInstance.get(`/api/qbo/taxCodes`);

      setTaxCodes(res?.data);
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setLoading((prev) => ({ ...prev, isTaxRefsLoading: false }));
    }
  };

  const getListOfTaxRefs = async () => {
    setLoading((prev) => ({ ...prev, isTaxRefsLoading: true }));
    try {
      const res = await axiosInstance.get(`/api/qbo/taxRates`);

      setTaxRates(res?.data);
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setLoading((prev) => ({ ...prev, isTaxRefsLoading: false }));
    }
  };

  useEffect(() => {
    getListOfServices();
    getListOfTaxCodes();
    getListOfTaxRefs();
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 1,
        },
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>QuickBooks Settings</DialogTitle>
      {loading.isServiceLoading || loading.isTaxCodesLoading || loading.isTaxRefsLoading ? (
        <Box height={150} position="relative">
          <CircularProgress
            size={20}
            color="black"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '20%',
            }}
          />
        </Box>
      ) : (
        <>
          <DialogContent>
            <Stack>
              <Select
                value={selectedService?.Id}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {services?.map((service) => (
                  <MenuItem key={service?.Id} value={service}>
                    {service?.Name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" size="small" sx={{ borderRadius: 0.5 }}>
              Cancel
            </Button>
            <Button variant="contained" size="small" sx={{ borderRadius: 0.5 }}>
              Save
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default QBOSettingsDialog;

QBOSettingsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
