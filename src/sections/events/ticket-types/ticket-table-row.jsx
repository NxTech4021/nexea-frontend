/* eslint-disable react/prop-types */
import dayjs from 'dayjs';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';

import Stack from '@mui/material/Stack';
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
  Drawer,
  Select,
  Switch,
  MenuItem,
  Typography,
  CardHeader,
  CardContent,
  FormControl,
  ListItemText,
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
    ticketTypeRequirement,
    sold,
    reservedQuantity,
  } = row;

  const confirm = useBoolean();
  const popover = usePopover();
  const smDown = useResponsive('down', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editedTicket, setEditedTicket] = useState({});

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
    setEditedTicket({
      ...row,
    });
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

  // const handleSaveEdit = async () => {
  //   try {
  //     setLoading(true);

  //     const updatedTicket = {
  //       ...editedTicket,
  //       price: parseFloat(editedTicket.price || 0),
  //       quantity: parseInt(editedTicket.quantity || 0, 10),
  //     };

  //     // Use the full URL explicitly to bypass any axios configuration issues
  //     const directUrl = `http://localhost:3001/api/ticket-type/${updatedTicket.id}`;
  //     console.log("Attempting request to:", directUrl);

  //     const response = await axios({
  //       method: 'put',
  //       url: directUrl,
  //       data: updatedTicket,
  //       withCredentials: true, // Include cookies if your authentication uses them
  //       headers: {
  //         'Content-Type': 'application/json',
  //         // Include any auth headers if needed
  //       }
  //     });

  //     console.log("Request successful:", response.data);

  //     // Close the dialog
  //     setEditDialogOpen(false);

  //     // Show success message
  //     enqueueSnackbar('Ticket updated successfully!', { variant: 'success' });

  //     // Call the parent's callback function to refresh the data
  //     if (typeof onEditSuccess === 'function') {
  //       onEditSuccess(response.data);
  //     }

  //   } catch (error) {
  //     console.error("Failed to update ticket:", error);

  //     // Detailed error information
  //     if (error.response) {
  //       console.log("Error status:", error.response.status);
  //       console.log("Error data:", error.response.data);
  //     }

  //     enqueueSnackbar(`Failed to update ticket: ${error.message}`, { variant: 'error' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Define the color based on the status

  const handleSaveEdit = async () => {
    try {
      setLoading(true);

      const updatedTicket = {
        ...editedTicket,
        price: parseFloat(editedTicket.price || 0),
        quantity: parseInt(editedTicket.quantity || 0, 10),
      };

      if (
        updatedTicket?.ticketTypeRequirement?.minimumTicketPerOrder >=
        updatedTicket?.ticketTypeRequirement?.maximumTicketPerOrder
      ) {
        toast.error('Minimum tickets must be less than the maximum tickets.');
        return;
      }

      const response = await axiosInstance.put(
        `/api/ticket-type/${updatedTicket.id}`,
        updatedTicket
      );

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

  // const handleEditSuccess = (updatedTicket) => {
  //   // Update local state immediately for fast UI response
  //   setTableData((prev) =>
  //     prev.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
  //   );

  //   // Optional: Re-validate with server data
  //   mutate();
  // };

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
          <Tooltip title="Edit Details" placement="top" arrow>
            <IconButton onClick={handleEditClick}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton onClick={toggleDrawer(true)}>
            <Iconify icon="hugeicons:view" />
          </IconButton>

          <Tooltip title="Delete" placement="top" arrow>
            <IconButton
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)}>
        <DialogTitle>
          <Typography variant="h4">Ticket Details</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Event Name"
            value={selectedTicket?.event?.name}
            InputProps={{ readOnly: true }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Type"
            value={selectedTicket?.type ? dataMapping[selectedTicket.type] : ''}
            InputProps={{ readOnly: true }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Category"
            value={selectedTicket?.category ? dataMapping[selectedTicket.category] : ''}
            InputProps={{ readOnly: true }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            value={`RM ${selectedTicket?.price.toFixed(2)}`}
            InputProps={{ readOnly: true }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Status"
            value={selectedTicket?.isActive ? 'Active' : 'Inactive'}
            InputProps={{ readOnly: true }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={selectedTicket?.description}
            InputProps={{ readOnly: true }}
            fullWidth
            margin="normal"
          />
          {ticketUrl && (
            <TextField
              label="Link Url"
              value={ticketUrl.url}
              InputProps={{ readOnly: true }}
              fullWidth
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
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
                  value={editedTicket.ticketTypeRequirement?.minimumTicketPerOrder || ''}
                  onChange={handleNestedFieldChange(
                    'ticketTypeRequirement',
                    'minimumTicketPerOrder'
                  )}
                  placeholder="No minimum"
                  variant="outlined"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                />
              </Stack>

              <Stack spacing={1} width={1}>
                <InputLabel required={false}>Maximum tickets per order</InputLabel>
                <TextField
                  type="number"
                  value={editedTicket.ticketTypeRequirement?.maximumTicketPerOrder || ''}
                  onChange={handleNestedFieldChange(
                    'ticketTypeRequirement',
                    'maximumTicketPerOrder'
                  )}
                  placeholder="No maximum"
                  variant="outlined"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
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
            onClick={() => setEditDialogOpen(false)}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={`Are you sure want to delete ${title}?`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
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
            height: '98vh',
            mr: 1.2,
            mt: 'auto',
            borderRadius: 2,
            width: { xs: '80vw', md: '40vw' },
            top: 8,
            overflow: 'hidden',
            p: 2,
          },
        }}
      >
        <Stack spacing={1} overflow="hidden">
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">{title}</Typography>
            <IconButton
              sx={{
                borderRadius: 1,
                boxShadow: 4,
              }}
              size="small"
              onClick={toggleDrawer(false)}
            >
              <Iconify icon="iconamoon:close-duotone" width={15} />
            </IconButton>
          </Stack>

          {/* Basic Information */}
          <Box overflow="auto" borderRadius={1} flexGrow={1}>
            <Card sx={{ borderRadius: 1, mb: 1 }}>
              <CardHeader title="Ticket Overview" titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
                  }}
                  gap={2}
                >
                  <ListItemText primary="Ticket title" secondary={title || 'N/A'} />
                  <ListItemText primary="Event name" secondary={name || 'N/A'} />
                  <ListItemText primary="Type" secondary={type || 'N/A'} />
                  <ListItemText primary="Category" secondary={category || 'N/A'} />
                  <ListItemText
                    primary="Price"
                    secondary={
                      Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: 'MYR',
                      }).format(price) || 'N/A'
                    }
                  />
                  <ListItemText
                    primary="Status"
                    secondary={
                      isActive ? (
                        <Label color="success">Active</Label>
                      ) : (
                        <Label color="error">Inactive</Label> || 'N/A'
                      )
                    }
                  />
                  <ListItemText
                    primary="Description"
                    secondary={description || 'N/A'}
                    sx={{ gridColumn: 'span 2' }}
                  />
                  <ListItemText
                    primary="Validity"
                    secondary={dayjs(validity).format('LL') || 'N/A'}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 1, mb: 1 }}>
              <CardHeader
                title="Ticket Requirement"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <CardContent>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1,1fr)', md: 'repeat(2,1fr)' },
                  }}
                  gap={2}
                >
                  {ticketTypeRequirement?.maximumTicketPerOrder ||
                  ticketTypeRequirement?.minimumTicketPerOrder ? (
                    <>
                      <Stack alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Minimum Ticket Requirement
                        </Typography>
                        <Typography variant="subtitle1">
                          {ticketTypeRequirement?.minimumTicketPerOrder || 0}
                        </Typography>
                      </Stack>
                      <Stack alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Maxiumum Ticket Requirement
                        </Typography>
                        <Typography variant="subtitle1">
                          {ticketTypeRequirement?.maximumTicketPerOrder || 0}
                        </Typography>
                      </Stack>
                    </>
                  ) : (
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      textAlign="center"
                      gridColumn="span 2"
                    >
                      Not specify
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 1 }}>
              <CardHeader title="Ticket Quantity" titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
                  }}
                  gap={2}
                >
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total quantity
                    </Typography>
                    <Box position="relative" display="inline-flex">
                      <CircularProgress
                        value={quantity || 0}
                        variant="determinate"
                        color="black"
                        size={80}
                        thickness={7}
                        sx={{
                          strokeLinecap: 'round',
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
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="subtitle2">{quantity || 0}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reserved quantity
                    </Typography>
                    <Box position="relative" display="inline-flex">
                      <CircularProgress
                        value={reservedQuantity || 0}
                        variant="determinate"
                        color="black"
                        size={80}
                        thickness={7}
                        sx={{
                          strokeLinecap: 'round',
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
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="subtitle2">{reservedQuantity || 0}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sold quantity
                    </Typography>
                    <Box position="relative" display="inline-flex">
                      <CircularProgress
                        value={sold || 0}
                        variant="determinate"
                        color="black"
                        size={80}
                        thickness={7}
                        sx={{
                          strokeLinecap: 'round',
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
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="subtitle2">{sold || 0}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>
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
