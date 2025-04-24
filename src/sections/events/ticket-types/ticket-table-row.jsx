/* eslint-disable react/prop-types */
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';

import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  Box,
  Card,
  Chip,
  Grid,
  Step,
  alpha,
  Stack,
  Drawer,
  Select,
  Switch,
  Stepper,
  Divider,
  MenuItem,
  StepLabel,
  Typography,
  CardHeader,
  CardContent,
  FormControl,
  // ListItemText,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { axiosInstance } from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

import AddOn from './components/addOn';
import { useAddOnsStore } from './hooks/use-add-on';
// ----------------------------------------------------------------------

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

const editStepper = [
  { label: 'Ticket information', icon: <Iconify icon="f7:tickets-fill" width={25} /> },
  { label: 'Add ons', icon: <Iconify icon="ri:function-add-fill" width={25} /> },
];

// Helper for rendering select fields with improved styling
const RenderSelectField = ({
  name,
  label,
  value,
  onChange,
  options,
  mappingObj,
  required = false,
}) => (
  <Stack width={1} spacing={0.5}>
    <InputLabel 
      required={required}
      sx={{ 
        fontSize: '0.875rem', 
        fontWeight: 500,
        color: 'text.primary' 
      }}
    >
      {label}
    </InputLabel>
    <FormControl fullWidth>
      <Select
        value={value || ''}
        onChange={onChange}
        displayEmpty
        sx={{
          '& .MuiSelect-select': {
            p: 1.5,
          },
          '&.MuiOutlinedInput-root': {
            borderRadius: 1.5,
            '& fieldset': {
              borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
        MenuProps={{ 
          PaperProps: { 
            sx: { 
              maxHeight: 240,
              mt: 0.5,
              boxShadow: (theme) => theme.customShadows.dropdown,
            } 
          }
        }}
        renderValue={(selected) =>
          // eslint-disable-next-line no-nested-ternary
          selected ? (mappingObj ? mappingObj[selected] : selected) : 'Select an option'
        }
      >
        <MenuItem disabled value="">
          <em>Select an option</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {mappingObj ? mappingObj[option] : option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Stack>
);

export default function TicketTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onViewDetails,
  onEditSuccess, // New prop for handling successful edits
}) {
  const {
    event: { name, id },
    id: ticketTypeId,
    ticketUrl,
    type,
    validity,
    category,
    price,
    title,
    isActive,
    description,
    quantity,
    requirement,
    sold,
    reservedQuantity,
    addOns, 
  } = row;

  const confirm = useBoolean();
  const popover = usePopover();
  const smDown = useResponsive('down', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editedTicket, setEditedTicket] = useState({});

  // Get addOns state and management functions
  const { setSelectedAddOns } = useAddOnsStore();
  const selectedAddOns = useAddOnsStore((state) => state.selectedAddOns);

  // Use useEffect to automatically update title when type or category changes
  useEffect(() => {
    const isNewTicketForm = !editedTicket.id;
    
    if (isNewTicketForm && editedTicket.type && editedTicket.category) {
      const newTitle = `${dataMapping[editedTicket.category]} - ${dataMapping[editedTicket.type]}`;
      setEditedTicket((prev) => ({
        ...prev,
        title: newTitle,
      }));
    }
  }, [editedTicket.type, editedTicket.category, editedTicket.id]);

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleViewDetails = () => {
    setSelectedTicket(row);
    setDetailsDialogOpen(true);
    if (onViewDetails) {
      onViewDetails(row);
    }
  };

  // const handleViewDetails = () => {
  //   setSelectedTicket(row);
  //   setDetailsDialogOpen(true);
  //   if (onViewDetails) {
  //     onViewDetails(row);
  //   }
  // };

  const handleEditClick = () => {
    // Reset step when opening
    setActiveStep(0);
    
    // Initialize requirement from ticketTypeRequirement or requirement
    const initialRequirement = {
      minimumTicketPerOrder: row.ticketTypeRequirement?.minimumTicketPerOrder || 
                            (row.requirement?.minimumTicketPerOrder !== undefined ? 
                              row.requirement.minimumTicketPerOrder : 1),
      maximumTicketPerOrder: row.ticketTypeRequirement?.maximumTicketPerOrder || 
                            (row.requirement?.maximumTicketPerOrder !== undefined ? 
                              row.requirement.maximumTicketPerOrder : 10),
    };
    
    // Initialize edited ticket with row data
    setEditedTicket({
      ...row,
      requirement: initialRequirement
    });
    
    // Initialize addOns from the ticket
    // First clear any existing selections
    selectedAddOns.forEach((addon) => setSelectedAddOns(addon));
    
    // Then set the addOns from the ticket
    if (row.addOns && row.addOns.length > 0) {
      row.addOns.forEach((addon) => setSelectedAddOns(addon));
    }
    
    setEditDialogOpen(true);
  };

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

  // Navigation functions for stepper
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);

      // Only send fields that may have changed or are required by backend
      // This prevents unintended overrides
      const updatedTicket = {
        id: editedTicket.id,
        title: editedTicket.title,
        price: parseFloat(editedTicket.price || 0),
        quantity: parseInt(editedTicket.quantity || 0, 10),
        isActive: editedTicket.isActive,
        description: editedTicket.description,
        selectedAddOns,
      };

      // Only include these fields if they were explicitly changed
      if (editedTicket.type !== row.type) {
        updatedTicket.type = editedTicket.type;
      }
      
      if (editedTicket.category !== row.category) {
        updatedTicket.category = editedTicket.category;
      }
      
      // Include requirement changes if they exist
      if (editedTicket.requirement) {
        updatedTicket.requirement = {
          minimumTicketPerOrder: editedTicket.requirement.minimumTicketPerOrder !== '' 
            ? parseInt(editedTicket.requirement.minimumTicketPerOrder, 10) 
            : null,
          maximumTicketPerOrder: editedTicket.requirement.maximumTicketPerOrder !== '' 
            ? parseInt(editedTicket.requirement.maximumTicketPerOrder, 10) 
            : null,
        };
      }

      console.log('Sending update with data:', updatedTicket);

      const response = await axiosInstance.put(
        `/api/ticket-type/${updatedTicket.id}`,
        updatedTicket
      );

      console.log('Request successful:', response.data);
      setEditDialogOpen(false);
      enqueueSnackbar('Ticket updated successfully!', { variant: 'success' });

      if (typeof onEditSuccess === 'function') {
        onEditSuccess(response.data);
      }
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

  const getStatusColor = (item) => {
    if (item) {
      return 'success';
    }
    return 'error';
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{title}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{dataMapping[type] || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{dataMapping[category] || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {new Intl.NumberFormat('en-MY', {
            minimumFractionDigits: 2,
            style: 'currency',
            currency: 'MYR',
          }).format(price)}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={getStatusColor(isActive)}>
            {isActive ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edit Ticket" placement="top" arrow>
            <IconButton 
              onClick={handleEditClick}
              sx={{ 
                color: 'primary.main',
                '&:hover': { 
                  bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.16),
                },
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View Details" placement="top" arrow>
            <IconButton 
              onClick={toggleDrawer(true)}
              sx={{ 
                color: 'info.main',
                '&:hover': { 
                  bgcolor: (theme) => alpha(theme.palette.info.lighter, 0.16),
                },
              }}
            >
              <Iconify icon="hugeicons:view" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Ticket" placement="top" arrow>
            <IconButton
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              sx={{ 
                color: 'error.main',
                '&:hover': { 
                  bgcolor: (theme) => alpha(theme.palette.error.lighter, 0.16),
                },
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* View Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.dialog,
          },
        }}
      >
        <DialogTitle
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            pb: 1,
            pt: 2.5
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Ticket Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View detailed information about this ticket
          </Typography>
        </DialogTitle>
        
        <Divider sx={{ borderStyle: 'dashed' }} />
        
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 1 }}
                  >
                    Event Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedTicket?.event?.name || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 1 }}
                  >
                    Ticket Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedTicket?.type ? dataMapping[selectedTicket.type] : 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 1 }}
                  >
                    Ticket Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedTicket?.category ? dataMapping[selectedTicket.category] : 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 1 }}
                  >
                    Price
                  </Typography>
                  <Typography 
                    variant="body1"
                    color="primary.main"
                    fontWeight={600}
                    fontSize="1.125rem"
                  >
                    {new Intl.NumberFormat('en-MY', {
                      minimumFractionDigits: 2,
                      style: 'currency',
                      currency: 'MYR',
                    }).format(selectedTicket?.price || 0)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 1 }}
                  >
                    Status
                  </Typography>
                  <Label 
                    variant="soft" 
                    color={selectedTicket?.isActive ? 'success' : 'error'}
                    sx={{ py: 0.75, px: 1.5 }}
                  >
                    {selectedTicket?.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </Box>
                
                {ticketUrl && (
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary" 
                      sx={{ mb: 1 }}
                    >
                      Link URL
                    </Typography>
                    <Typography 
                      variant="body2"
                      component="div"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.8),
                        border: '1px dashed',
                        borderColor: 'divider',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                      }}
                    >
                      {ticketUrl.url}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
            
            <Grid item xs={12}>
              <Box>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ mb: 1 }}
                >
                  Description
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {selectedTicket?.description || 'No description provided'}
                </Typography>
              </Box>
            </Grid>
            
            {/* Ticket Quantities */}
            <Grid item xs={12}>
              <Typography 
                variant="subtitle1"
                sx={{ mb: 2, mt: 1 }}
              >
                Ticket Quantities
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(3,1fr)' },
                  gap: 2,
                }}
              >
                <Card 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    boxShadow: (theme) => theme.customShadows.z8,
                    bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.08),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        borderRadius: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      }}
                    >
                      <Iconify 
                        icon="solar:ticket-bold" 
                        width={24} 
                        sx={{ color: 'primary.main' }} 
                      />
                    </Box>
                    
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Total Quantity
                      </Typography>
                      <Typography variant="h4">
                        {selectedTicket?.quantity || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
                
                <Card 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    boxShadow: (theme) => theme.customShadows.z8,
                    bgcolor: (theme) => alpha(theme.palette.warning.lighter, 0.08),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        borderRadius: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                      }}
                    >
                      <Iconify 
                        icon="solar:bookmark-bold" 
                        width={24} 
                        sx={{ color: 'warning.main' }} 
                      />
                    </Box>
                    
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Reserved
                      </Typography>
                      <Typography variant="h4">
                        {selectedTicket?.reservedQuantity || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
                
                <Card 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    boxShadow: (theme) => theme.customShadows.z8,
                    bgcolor: (theme) => alpha(theme.palette.success.lighter, 0.08),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        borderRadius: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                      }}
                    >
                      <Iconify 
                        icon="solar:cart-check-bold" 
                        width={24} 
                        sx={{ color: 'success.main' }} 
                      />
                    </Box>
                    
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Sold
                      </Typography>
                      <Typography variant="h4">
                        {selectedTicket?.sold || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Box>
              
              {/* Ticket requirement information */}
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>Order Limits</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:minimise-square-bold" width={20} color="info.main" />
                      <Typography variant="body2" color="text.secondary">
                        Minimum tickets per order: 
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {row.ticketTypeRequirement?.minimumTicketPerOrder || 
                          (row.requirement?.minimumTicketPerOrder !== undefined ? 
                            row.requirement.minimumTicketPerOrder : 'No minimum')}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:maximise-square-bold" width={20} color="info.main" />
                      <Typography variant="body2" color="text.secondary">
                        Maximum tickets per order: 
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {row.ticketTypeRequirement?.maximumTicketPerOrder || 
                          (row.requirement?.maximumTicketPerOrder !== undefined ? 
                            row.requirement.maximumTicketPerOrder : 'No maximum')}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Add Ons in Details Dialog */}
            {selectedTicket?.addOns && selectedTicket.addOns.length > 0 && (
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle1"
                  sx={{ mb: 2, mt: 1 }}
                >
                  Add-ons
                </Typography>
                
                <Grid container spacing={2}>
                  {selectedTicket.addOns.map((addon) => (
                    <Grid item xs={12} sm={6} md={4} key={addon.id}>
                      <Box
                        sx={{
                          p: 2,
                          height: '100%',
                          borderRadius: 2,
                          bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.08),
                          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: (theme) => theme.customShadows.z8,
                            bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.16),
                          }
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>{addon.name}</Typography>
                        <Typography 
                          variant="body2" 
                          color="primary.main" 
                          fontWeight={600} 
                          gutterBottom
                        >
                          {new Intl.NumberFormat('en-MY', {
                            minimumFractionDigits: 2,
                            style: 'currency',
                            currency: 'MYR',
                          }).format(addon.price)}
                        </Typography>
                        {addon.description && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {addon.description}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <Divider sx={{ borderStyle: 'dashed' }} />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setDetailsDialogOpen(false)} 
            variant="contained"
            sx={{ px: 3 }}
            startIcon={<Iconify icon="solar:close-circle-bold" />}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog with Stepper */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullScreen={smDown}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '-webkit-fill-available',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.dialog,
            scrollbarWidth: 'none',
          },
        }}
      >
        <DialogTitle
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1,
            pt: 2.5
          }}
        >
          <Stack>
            <Typography variant="h5" fontWeight={600}>
              {editedTicket.id ? 'Edit Ticket' : 'Create Ticket'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Customize your ticket details for event attendees
            </Typography>
          </Stack>
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
              label={
                <Typography variant="body2" color={editedTicket.isActive ? 'success.main' : 'text.disabled'}>
                  {editedTicket.isActive ? 'Active' : 'Inactive'}
                </Typography>
              }
              labelPlacement="start"
              sx={{ ml: 2 }}
            />
          </Tooltip>
        </DialogTitle>

        {/* Stepper */}
        <Stepper 
          alternativeLabel 
          activeStep={activeStep} 
          sx={{ 
            px: 3, 
            py: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.08),
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: (theme) => alpha(theme.palette.grey[500], 0.12),
          }}
        >
          {editStepper.map((item, index) => {
            const labelProps = {};

            if (index === 1) {
              labelProps.optional = <Typography variant="caption">Optional</Typography>;
            }
            return (
              <Step key={item.label}>
                <StepLabel 
                  icon={
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: activeStep >= index ? 'primary.main' : 'background.neutral',
                        color: activeStep >= index ? 'primary.contrastText' : 'text.disabled',
                        borderRadius: '50%',
                        boxShadow: activeStep >= index ? (theme) => theme.customShadows.primary : 'none',
                      }}
                    >
                      {item.icon}
                    </Box>
                  } 
                  {...labelProps}
                >
                  <Typography 
                    variant="subtitle2" 
                    color={activeStep >= index ? 'text.primary' : 'text.disabled'}
                  >
                    {item.label}
                  </Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        <DialogContent 
          sx={{ 
            px: { xs: 2, md: 3 }, 
            py: 3,
            scrollbarWidth: 'none' 
          }}
        >
          {/* Step 1: Ticket information */}
          {activeStep === 0 && (
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={3} pt={1}>
              <Stack direction="row" justifyContent="stretch" gap={2} width={1}>
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

              <Stack spacing={0.5} width={1}>
                <InputLabel 
                  required 
                  sx={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    color: 'text.primary' 
                  }}
                >
                  Title
                </InputLabel>
                <TextField
                  fullWidth
                  value={editedTicket.title || ''}
                  onChange={handleEditChange('title')}
                  placeholder="Ticket Title"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      p: 0.5,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Stack>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)' }}
                width={1}
                gap={2}
              >
                <Stack spacing={0.5} width={1}>
                  <InputLabel 
                    required
                    sx={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      color: 'text.primary' 
                    }}
                  >
                    Price
                  </InputLabel>
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
                    InputProps={{
                      sx: {
                        borderRadius: 1.5,
                        p: 0.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Stack>

                <Stack spacing={0.5} width={1}>
                  <InputLabel 
                    required
                    sx={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      color: 'text.primary' 
                    }}
                  >
                    Quantity
                  </InputLabel>
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
                    InputProps={{
                      sx: {
                        borderRadius: 1.5,
                        p: 0.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Stack>

                <Stack spacing={0.5} width={1}>
                  <InputLabel 
                    sx={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      color: 'text.primary' 
                    }}
                  >
                    Minimum tickets per order
                  </InputLabel>
                  <TextField
                    type="number"
                    value={editedTicket.requirement?.minimumTicketPerOrder || ''}
                    onChange={handleNestedFieldChange('requirement', 'minimumTicketPerOrder')}
                    placeholder="No minimum"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      sx: {
                        borderRadius: 1.5,
                        p: 0.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Stack>

                <Stack spacing={0.5} width={1}>
                  <InputLabel 
                    sx={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      color: 'text.primary' 
                    }}
                  >
                    Maximum tickets per order
                  </InputLabel>
                  <TextField
                    type="number"
                    value={editedTicket.requirement?.maximumTicketPerOrder || ''}
                    onChange={handleNestedFieldChange('requirement', 'maximumTicketPerOrder')}
                    placeholder="No maximum"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      sx: {
                        borderRadius: 1.5,
                        p: 0.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Stack>
              </Box>

              <Stack spacing={0.5} width={1}>
                <InputLabel 
                  required
                  sx={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    color: 'text.primary' 
                  }}
                >
                  Description
                </InputLabel>
                <TextField
                  value={editedTicket.description || ''}
                  onChange={handleEditChange('description')}
                  placeholder="Ticket Description"
                  multiline
                  rows={4}
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          )}

          {/* Step 2: Add Ons */}
          {activeStep === 1 && <AddOn />}
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2,
            bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
            borderTop: '1px solid',
            borderColor: (theme) => alpha(theme.palette.grey[500], 0.12),
            gap: 1
          }}
        >
          {activeStep === 0 ? (
            <>
              <Button
                variant="outlined"
                onClick={() => setEditDialogOpen(false)}
                sx={{ 
                  px: 3,
                  py: 1,
                  color: 'text.primary',
                  borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ 
                  px: 3,
                  py: 1,
                  boxShadow: (theme) => theme.customShadows.primary
                }}
                endIcon={<Iconify icon="eva:arrow-forward-fill" />}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ 
                  px: 3,
                  py: 1,
                  color: 'text.primary',
                  borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper'
                  }
                }}
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
              >
                Back
              </Button>
              <LoadingButton
                loading={loading}
                onClick={handleSaveEdit}
                variant="contained"
                sx={{ 
                  px: 3,
                  py: 1,
                  boxShadow: (theme) => theme.customShadows.primary
                }}
                endIcon={<Iconify icon="eva:checkmark-fill" />}
              >
                Save Changes
              </LoadingButton>
            </>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={
          <Stack spacing={1} alignItems="center" sx={{ pt: 1, pb: 1 }}>
            <Iconify 
              icon="solar:danger-triangle-bold-duotone" 
              width={44} 
              height={44} 
              sx={{ color: 'error.main' }} 
            />
            <Typography variant="h5" gutterBottom>
              Delete Ticket
            </Typography>
          </Stack>
        }
        content={
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Are you sure you want to permanently delete <strong>{title}</strong>?
            <br />
            This action cannot be undone.
          </Typography>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            sx={{ px: 2, boxShadow: (theme) => theme.customShadows.error }}
          >
            Delete
          </Button>
        }
      />

      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        anchor="right"
        sx={{
          '& .MuiDrawer-paper': {
            height: '100vh',
            width: { xs: '90vw', sm: '70vw', md: '50vw', lg: '40vw' },
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            p: 0,
            boxShadow: (theme) => theme.customShadows.z24,
            bgcolor: '#E8E8E8',
          },
        }}
      >
        {/* Header */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{
            p: 3,
            pb: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            bgcolor: (theme) => alpha(theme.palette.background.default, 0.9),
          }}
        >
          <Stack>
            <Typography variant="h5" fontWeight={600}>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {dataMapping[type]} • {dataMapping[category]}
            </Typography>
          </Stack>
          <IconButton
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              color: 'text.primary',
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
              },
            }}
            onClick={toggleDrawer(false)}
          >
            <Iconify icon="eva:close-fill" width={18} />
          </IconButton>
        </Stack>

        {/* Content */}
        <Box 
          sx={{ 
            p: { xs: 2.5, md: 3 }, 
            pt: { xs: 3, md: 4 },
            pb: { xs: 14, md: 16 },
            height: 'calc(100% - 76px)',
            overflow: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
            },
          }}
        >
          {/* Status & Price Banner */}
          <Card
            sx={{
              mb: 3.5,
              borderRadius: 2,
              p: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.12),
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="overline" color="text.secondary">Ticket Price</Typography>
                <Typography variant="h3" color="primary.main">
                  {new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                  }).format(price)}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<Iconify icon={isActive ? 'eva:checkmark-circle-fill' : 'eva:close-circle-fill'} />}
                  label={isActive ? 'Active' : 'Inactive'}
                  color={isActive ? 'success' : 'error'}
                  variant="soft"
                  sx={{ borderRadius: 1, px: 1, height: 32 }}
                />
                
                {/* <Chip
                  icon={<Iconify icon="solar:ticket-bold" />}
                  label={`${sold} / ${quantity}`}
                  color="info"
                  variant="soft"
                  sx={{ borderRadius: 1, px: 1, height: 32 }}
                /> */}
              </Stack>
            </Stack>
          </Card>

          {/* Event Information */}
          <Card sx={{ mb: 3.5, borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader 
              title="Event Information" 
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              avatar={
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  }}
                >
                  <Iconify icon="solar:calendar-bold" width={18} color="primary.main" />
                </Box>
              }
              sx={{
                bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                p: 2, // Control header padding
                pb: 1.75,
              }}
            />
            <Divider sx={{ borderStyle: 'dashed' }} />
            <CardContent sx={{ pt: 2.5, pb: 2.5 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Event Name</Typography>
                  <Typography variant="body1" fontWeight={500}>{name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Ticket Type</Typography>
                  <Typography variant="body1">{dataMapping[type] || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{dataMapping[category] || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Valid Until</Typography>
                  <Typography variant="body1">{dayjs(validity).format('LL') || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Ticket Description */}
          <Card sx={{ mb: 3.5, borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader 
              title="Description" 
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              avatar={
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                  }}
                >
                  <Iconify icon="solar:document-text-bold" width={18} color="info.main" />
                </Box>
              }
              sx={{
                bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                p: 2, // Control header padding
                pb: 1.75,
              }}
            />
            <Divider sx={{ borderStyle: 'dashed' }} />
            <CardContent sx={{ pt: 2.5, pb: 2.5 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {description || 'No description provided for this ticket.'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Ticket Quantities */}
          <Card sx={{ mb: 3.5, borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader 
              title="Ticket Statistics" 
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              avatar={
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  }}
                >
                  <Iconify icon="solar:chart-bold" width={18} color="success.main" />
                </Box>
              }
              sx={{
                bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                p: 2, // Control header padding
                pb: 1.75,
              }}
            />
            <Divider sx={{ borderStyle: 'dashed' }} />
            <CardContent sx={{ pt: 3, pb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Stack alignItems="center" spacing={1.5} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        position: 'relative',
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={120}
                        thickness={4}
                        sx={{
                          opacity: 0.2,
                          color: 'primary.main',
                          position: 'absolute',
                        }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={Math.min(100, (quantity / Math.max(quantity, 1)) * 100)}
                        size={120}
                        thickness={4}
                        sx={{
                          strokeLinecap: 'round',
                          color: 'primary.main',
                          position: 'absolute',
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">{quantity}</Typography>
                        <Typography variant="caption" color="text.secondary">Total</Typography>
                      </Box>
                    </Box>
                    <Typography variant="subtitle2" textAlign="center">Total Quantity</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Stack alignItems="center" spacing={1.5} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        position: 'relative',
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={120}
                        thickness={4}
                        sx={{
                          opacity: 0.2,
                          color: 'warning.main',
                          position: 'absolute',
                        }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={Math.min(100, (reservedQuantity / Math.max(quantity, 1)) * 100)}
                        size={120}
                        thickness={4}
                        sx={{
                          strokeLinecap: 'round',
                          color: 'warning.main',
                          position: 'absolute',
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">{reservedQuantity}</Typography>
                        <Typography variant="caption" color="text.secondary">Reserved</Typography>
                      </Box>
                    </Box>
                    <Typography variant="subtitle2" textAlign="center">Reserved Tickets</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Stack alignItems="center" spacing={1.5} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        position: 'relative',
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={120}
                        thickness={4}
                        sx={{
                          opacity: 0.2,
                          color: 'success.main',
                          position: 'absolute',
                        }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={Math.min(100, (sold / Math.max(quantity, 1)) * 100)}
                        size={120}
                        thickness={4}
                        sx={{
                          strokeLinecap: 'round',
                          color: 'success.main',
                          position: 'absolute',
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">{sold}</Typography>
                        <Typography variant="caption" color="text.secondary">Sold</Typography>
                      </Box>
                    </Box>
                    <Typography variant="subtitle2" textAlign="center">Sold Tickets</Typography>
                  </Stack>
                </Grid>
              </Grid>
              
              {/* Ticket requirement information */}
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>Order Limits</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:minimise-square-bold" width={20} color="info.main" />
                      <Typography variant="body2" color="text.secondary">
                        Minimum tickets per order: 
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {row.ticketTypeRequirement?.minimumTicketPerOrder || 
                          (row.requirement?.minimumTicketPerOrder !== undefined ? 
                            row.requirement.minimumTicketPerOrder : 'No minimum')}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:maximise-square-bold" width={20} color="info.main" />
                      <Typography variant="body2" color="text.secondary">
                        Maximum tickets per order: 
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {row.ticketTypeRequirement?.maximumTicketPerOrder || 
                          (row.requirement?.maximumTicketPerOrder !== undefined ? 
                            row.requirement.maximumTicketPerOrder : 'No maximum')}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Add Ons Section */}
          {row.addOns && row.addOns.length > 0 && (
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardHeader 
                title="Available Add-ons" 
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                avatar={
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                    }}
                  >
                    <Iconify icon="solar:add-square-bold" width={18} color="secondary.main" />
                  </Box>
                }
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                  p: 2,
                }}
              />
              <Divider sx={{ borderStyle: 'dashed' }} />
              <CardContent sx={{ pt: 2.5, pb: 3 }}>
                <Grid container spacing={2.5}>
                  {row.addOns.map((addon) => (
                    <Grid item xs={12} sm={6} key={addon.id}>
                      <Box
                        sx={{
                          p: 2,
                          height: '100%',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.04),
                          borderLeft: '4px solid',
                          borderColor: 'primary.main',
                          boxShadow: (theme) => `0 0 16px 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: (theme) => theme.customShadows.z16,
                            bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.08),
                          }
                        }}
                      >
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2">{addon.name}</Typography>
                            <Chip
                              label={new Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: 'MYR',
                              }).format(addon.price)}
                              color="primary"
                              size="small"
                              sx={{ 
                                height: 24, 
                                fontWeight: 600,
                                borderRadius: 1 
                              }}
                            />
                          </Stack>
                          
                          {addon.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {addon.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: { xs: '90vw', sm: '70vw', md: '50vw', lg: '40vw' },
            p: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.background.default, 0.9),
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={toggleDrawer(false)}
            startIcon={<Iconify icon="eva:close-fill" />}
          >
            Close
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditClick}
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit Ticket
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

TicketTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewDetails: PropTypes.func,
  // onEditRow: PropTypes.func,
  onEditSuccess: PropTypes.func, // Added this prop
};
