import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Stack,
  Button,
  Dialog,
  Select,
  MenuItem,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { axiosInstance } from 'src/utils/axios';

const QBOSettingsDialog = ({ open, onClose, eventId }) => {
  const [services, setServices] = useState(null);
  const [taxRates, setTaxRates] = useState(null);
  const [taxCodes, setTaxCodes] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedTaxCode, setSelectedTaxCode] = useState(null);
  const [selectedTaxRate, setSelectedTaxRate] = useState(null);

  const [loading, setLoading] = useState({
    isServiceLoading: false,
    isTaxCodesLoading: false,
    isTaxRefsLoading: false,
  });

  const buttonDisabled = !selectedService || !selectedTaxCode || !selectedTaxRate;

  const getListOfServices = async () => {
    setLoading((prev) => ({ ...prev, isServiceLoading: true }));
    try {
      const res = await axiosInstance.get(`/api/qbo/services`);

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

  // const getListOfTaxRefs = async () => {
  //   setLoading((prev) => ({ ...prev, isTaxRefsLoading: true }));
  //   try {
  //     const res = await axiosInstance.get(`/api/qbo/taxRates`);

  //     setTaxRates(res?.data);
  //   } catch (error) {
  //     toast.error(error);
  //     console.log(error);
  //   } finally {
  //     setLoading((prev) => ({ ...prev, isTaxRefsLoading: false }));
  //   }
  // };

  const handleSubmit = async () => {
    try {
      await axiosInstance.post(`/api/event/qbo/settings/${eventId}`, {
        selectedService,
        selectedTaxCode,
        selectedTaxRate,
      });
      setSelectedService(null);
      setSelectedTaxCode(null);
      setSelectedTaxRate(null);
      onClose();
    } catch (error) {
      toast.error(error?.message);
      console.log(error);
    }
  };

  useEffect(() => {
    getListOfServices();
    getListOfTaxCodes();
    // getListOfTaxRefs();
  }, []);

  useEffect(() => {
    if (selectedTaxCode) {
      setTaxRates(selectedTaxCode?.SalesTaxRateList?.TaxRateDetail);
    }
  }, [selectedTaxCode]);

  console.log(selectedTaxCode);

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
            <Stack spacing={2}>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Services</InputLabel>
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
              </FormControl>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Tax Codes</InputLabel>
                <Select
                  value={selectedTaxCode?.Id}
                  onChange={(e) => setSelectedTaxCode(e.target.value)}
                >
                  {taxCodes?.map((code) => (
                    <MenuItem key={code?.Id} value={code}>
                      {code?.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedTaxCode && (
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel>Tax Rates</InputLabel>
                  <Select
                    value={selectedTaxRate?.Id}
                    onChange={(e) => setSelectedTaxRate(e.target.value)}
                  >
                    {taxRates?.map((rate) => (
                      <MenuItem key={rate?.TaxRateRef?.value} value={rate}>
                        {rate?.TaxRateRef?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              size="small"
              sx={{ borderRadius: 0.5 }}
              onClick={() => {
                setSelectedService(null);
                setSelectedTaxCode(null);
                setSelectedTaxRate(null);
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ borderRadius: 0.5 }}
              disabled={buttonDisabled}
              onClick={handleSubmit}
            >
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
  eventId: PropTypes.string,
};
