import dayjs from 'dayjs';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  Box,
  Card,
  Stack,
  Drawer,
  Typography,
  CardHeader,
  CardContent,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
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

export default function TicketTableRow({ row, selected, onSelectRow, onDeleteRow, onViewDetails }) {
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
    sold,
    reservedQuantity,
  } = row;

  const confirm = useBoolean();
  const popover = usePopover();
  // const loading = useBoolean();

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

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

  // Define the color based on the status
  const getStatusColor = (item) => {
    if (item) {
      return 'success';
    }
    return 'error';
  };

  // const generateUrl = async () => {
  //   try {
  //     loading.onTrue();

  //     await axiosInstance.post(endpoints.ticketType.generateUrl, {
  //       eventId: id,
  //       ticketTypeId,
  //     });
  //   } catch (error) {
  //     enqueueSnackbar(error?.message, {
  //       variant: 'error',
  //     });
  //   } finally {
  //     loading.onFalse();
  //   }
  // };

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
          <Tooltip title="View Details" placement="top" arrow>
            <IconButton onClick={toggleDrawer(true)}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

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
            value={selectedTicket?.type}
            InputProps={{ readOnly: true }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Category"
            value={selectedTicket?.category}
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
};
