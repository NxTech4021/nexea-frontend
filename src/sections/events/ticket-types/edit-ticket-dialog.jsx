import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Dialog,
  Button,
  Switch,
  Select,
  Tooltip,
  MenuItem,
  TextField,
  InputLabel,
  DialogTitle,
  FormControl,
  ListItemText,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { axiosInstance } from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

// Ticket types and categories mapping
export const dataMapping = {
  earlyBird: 'Early Bird',
  general: 'General',
  startup: 'Startup',
  vip: 'Vip',
  standard: 'Standard',
  speaker: 'Speaker',
  afterParty: 'After Party',
};

// Ticket types and categories for dropdowns
const ticketTypes = ['earlyBird', 'standard'];
const ticketCategories = ['startup', 'general', 'speaker', 'vip'];

// Helper for rendering select fields
const RenderSelectField = ({
  name,
  label,
  value,
  onChange,
  options,
  mappingObj,
  required = false,
}) => (
  <Stack width={1} spacing={1}>
    <InputLabel required={required}>{label}</InputLabel>
    <FormControl fullWidth>
      <Select
        value={value || ''}
        onChange={onChange}
        displayEmpty
        MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
        renderValue={(selected) => {
          if (!selected) return 'Select an option';
          if (mappingObj) return mappingObj[selected];
          return selected;
        }}
      >
        <MenuItem disabled value="">
          <em>Select an option</em>
        </MenuItem>
        {options.map((option) => {
          const optionLabel = mappingObj ? mappingObj[option] : option;
          return (
            <MenuItem key={option} value={option}>
              {optionLabel}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  </Stack>
);

RenderSelectField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  mappingObj: PropTypes.object,
  required: PropTypes.bool,
};

export default function EditTicketDialog({ open, onClose, ticket, onEditSuccess }) {
  const smDown = useResponsive('down', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editedTicket, setEditedTicket] = useState({});

  // Populate form when ticket changes
  useEffect(() => {
    if (ticket) {
      // Map ticket requirements from ticketTypeRequirement relation if it exists
      const requirement = {
        minimumTicketPerOrder: ticket.ticketTypeRequirement?.minimumTicketPerOrder || 
                              (ticket.requirement?.minimumTicketPerOrder !== undefined ? 
                                ticket.requirement.minimumTicketPerOrder : 1),
        maximumTicketPerOrder: ticket.ticketTypeRequirement?.maximumTicketPerOrder || 
                              (ticket.requirement?.maximumTicketPerOrder !== undefined ? 
                                ticket.requirement.maximumTicketPerOrder : 10),
      };
      
      console.log('Initializing ticket form with requirements:', requirement);
      
      setEditedTicket({
        ...ticket,
        requirement
      });
    }
  }, [ticket]);

  // Use useEffect to automatically update title when type or category changes
  useEffect(() => {
    if (editedTicket.type && editedTicket.category) {
      const newTitle = `${dataMapping[editedTicket.category]} - ${dataMapping[editedTicket.type]}`;
      setEditedTicket((prev) => ({
        ...prev,
        title: newTitle,
      }));
    }
  }, [editedTicket.type, editedTicket.category]);

  const handleEditChange = (field) => (event) => {
    let { value } = event.target;

    // Handle special case for isActive toggle
    if (field === 'isActive') {
      value = event.target.checked;
    }

    setEditedTicket((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedFieldChange = (parentField, childField) => (event) => {
    const { value } = event.target;

    setEditedTicket((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value,
      },
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);

      // Convert string values to appropriate types before sending to API
      const updatedTicket = {
        ...editedTicket,
        price: parseFloat(editedTicket.price || 0),
        quantity: parseInt(editedTicket.quantity || 0, 10),
        requirement: {
          minimumTicketPerOrder: editedTicket.requirement?.minimumTicketPerOrder !== undefined ? 
                                parseInt(editedTicket.requirement.minimumTicketPerOrder, 10) : 1,
          maximumTicketPerOrder: editedTicket.requirement?.maximumTicketPerOrder !== undefined ? 
                                parseInt(editedTicket.requirement.maximumTicketPerOrder, 10) : 10,
        }
      };

      console.log('Sending updated ticket to API:', updatedTicket);

      const response = await axiosInstance.put(
        `/api/ticket-type/${updatedTicket.id}`,
        updatedTicket
      );

      console.log('Ticket update response:', response.data);
      
      // Backend response format: { message: string, ticket: TicketData }
      // Extract the ticket data from the response
      const updatedTicketData = response.data.ticket || response.data;
      
      // Add event data back if it was lost in the update
      if (!updatedTicketData.event && editedTicket.event) {
        updatedTicketData.event = editedTicket.event;
      }
      
      console.log('Processed ticket data:', updatedTicketData);
      
      // Show success message
      enqueueSnackbar('Ticket updated successfully!', { variant: 'success' });
      
      // First close the dialog to avoid any state conflicts
      onClose();
      
      // Then call the success callback after a short delay to ensure UI consistency
      setTimeout(() => {
        if (typeof onEditSuccess === 'function') {
          onEditSuccess(updatedTicketData);
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to update ticket:', error);

      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        enqueueSnackbar(
          `Failed to update ticket: ${error.response.data.message || error.message}`,
          {
            variant: 'error',
          }
        );
      } else {
        enqueueSnackbar(`Failed to update ticket: ${error.message}`, { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render status content to avoid nested ternary
//   const renderStatusContent = (isActive) => {
//     if (isActive) {
//       return <Label color="success">Active</Label>;
//     }
//     return <Label color="error">Inactive</Label>;
//   };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <ListItemText
          primary="Edit Ticket Type"
          secondary="Update your ticket type details"
          primaryTypographyProps={{ variant: 'h5' }}
        />
        <Tooltip
          title={
            editedTicket.isActive
              ? 'Ticket will be visible in cart'
              : 'Ticket will be hidden from cart'
          }
          placement="top"
          arrow
        >
          <FormControlLabel
            control={
              <Switch
                checked={editedTicket.isActive || false}
                onChange={handleEditChange('isActive')}
                color="primary"
              />
            }
            label="Active"
            labelPlacement="start"
            sx={{ ml: 2 }}
          />
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ scrollbarWidth: 'none' }}>
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2} pt={1}>
          <Stack direction="row" justifyContent="stretch" gap={1} width={1}>
            <RenderSelectField
              name="type"
              label="Type"
              value={editedTicket.type}
              onChange={handleEditChange('type')}
              options={ticketTypes}
              mappingObj={dataMapping}
              required
            />
            <RenderSelectField
              name="category"
              label="Category"
              value={editedTicket.category}
              onChange={handleEditChange('category')}
              options={ticketCategories}
              mappingObj={dataMapping}
              required
            />
          </Stack>

          <Stack spacing={1} width={1}>
            <InputLabel required>Title</InputLabel>
            <TextField
              fullWidth
              value={editedTicket.title || ''}
              onChange={handleEditChange('title')}
              placeholder="Ticket Title"
            />
          </Stack>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)' }}
            width={1}
            gap={1}
          >
            <Stack spacing={1} width={1}>
              <InputLabel required>Price</InputLabel>
              <NumericFormat
                customInput={TextField}
                thousandSeparator
                prefix="RM "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                value={editedTicket.price}
                onValueChange={(values) => {
                  setEditedTicket((prev) => ({
                    ...prev,
                    price: values.value,
                  }));
                }}
                placeholder="Price (RM)"
                variant="outlined"
                fullWidth
              />
            </Stack>

            <Stack spacing={1} width={1}>
              <InputLabel required>Quantity</InputLabel>
              <TextField
                type="number"
                value={editedTicket.quantity || ''}
                onChange={handleEditChange('quantity')}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                placeholder="Quantity"
                variant="outlined"
                fullWidth
                required
              />
            </Stack>

            <Stack spacing={1} width={1}>
              <InputLabel required={false}>Minimum tickets per order</InputLabel>
              <TextField
                type="number"
                value={editedTicket.requirement?.minimumTicketPerOrder || ''}
                onChange={handleNestedFieldChange('requirement', 'minimumTicketPerOrder')}
                placeholder="No minimum"
                variant="outlined"
                fullWidth
              />
            </Stack>

            <Stack spacing={1} width={1}>
              <InputLabel required={false}>Maximum tickets per order</InputLabel>
              <TextField
                type="number"
                value={editedTicket.requirement?.maximumTicketPerOrder || ''}
                onChange={handleNestedFieldChange('requirement', 'maximumTicketPerOrder')}
                placeholder="No maximum"
                variant="outlined"
                fullWidth
              />
            </Stack>
          </Box>

          <Stack spacing={1} width={1}>
            <InputLabel required>Description</InputLabel>
            <TextField
              value={editedTicket.description || ''}
              onChange={handleEditChange('description')}
              placeholder="Ticket Description"
              multiline
              rows={4}
              fullWidth
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ fontWeight: 400 }}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={loading}
          onClick={handleSaveEdit}
          variant="contained"
          sx={{ fontWeight: 400 }}
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

EditTicketDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  ticket: PropTypes.object,
  onEditSuccess: PropTypes.func,
  addOn: PropTypes.object,
  }; 