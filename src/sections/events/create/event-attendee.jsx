/* eslint-disable no-unused-vars */
// import { toast } from 'react-toastify';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import useSWR, { mutate } from 'swr';
/* eslint-disable consistent-return */
import { useParams } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Paper,
  Button,
  Dialog,
  Tooltip,
  Container,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDataGridColumnsStore } from 'src/hooks/zustand/useDataGridColumns';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

// import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CreateAttendeeForm from 'src/components/modalAdd/attendeeform';

import EventFilters from './event-filters';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

// ----------------------------------------------------------------------

// Status cell component with hover behavior
const StatusCell = ({ params, updateAttendees, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStatusToggle = async (newStatus) => {
    setIsUpdating(true);

    const updatedRow = {
      ...params.row,
      status: newStatus,
    };

    try {
      await updateAttendees(updatedRow);
      if (onStatusUpdate) {
        onStatusUpdate(params.row.id, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const isCheckedIn = params.value === 'checkedIn';
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        gap: 1,
        position: 'relative',
      }}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ flex: 1 }}>
        {isCheckedIn ? (
          <Chip
            icon={<Iconify icon="eva:checkmark-circle-2-fill" sx={{ width: 16, height: 16 }} />}
            label="Checked In"
            size="small"
            sx={{
              height: 24,
              color: '#229A16',
              bgcolor: 'rgba(34, 154, 22, 0.08)',
              border: '1px solid rgba(34, 154, 22, 0.2)',
              fontSize: 12,
              fontWeight: 600,
              width: 'fit-content',
              '&:hover': {
                color: '#229A16',
                bgcolor: 'rgba(34, 154, 22, 0.08)',
                border: '1px solid rgba(34, 154, 22, 0.2)',
              },
              '& .MuiChip-icon': {
                color: '#229A16',
                ml: 0.5,
              },
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        ) : (
          <Chip
            icon={<Iconify icon="eva:close-circle-fill" sx={{ width: 16, height: 16 }} />}
            label="Pending"
            size="small"
            sx={{
              height: 24,
              color: '#B72136',
              bgcolor: 'rgba(183, 33, 54, 0.08)',
              border: '1px solid rgba(183, 33, 54, 0.2)',
              fontSize: 12,
              fontWeight: 600,
              width: 'fit-content',
              '&:hover': {
                color: '#B72136',
                bgcolor: 'rgba(183, 33, 54, 0.08)',
                border: '1px solid rgba(183, 33, 54, 0.2)',
              },
              '& .MuiChip-icon': {
                color: '#B72136',
                ml: 0.5,
              },
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        )}
      </Box>

      {/* Vertical Divider */}
      <Box
        sx={{
          width: '1px',
          height: '20px',
          bgcolor:
            theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          mx: 1,
          flexShrink: 0,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        {isCheckedIn ? (
          // isHovered && (
          <Tooltip title="Mark as Pending">
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusToggle('pending');
              }}
              disabled={isUpdating}
              sx={{
                height: '28px',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'transparent',
                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                border: '1px solid #eee',
                fontWeight: 500,
                fontSize: '0.7rem',
                textTransform: 'none',
                minWidth: 'auto',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  bgcolor:
                    theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.04)'
                      : 'rgba(255, 255, 255, 0.08)',
                  color: theme.palette.mode === 'light' ? '#111' : '#fff',
                },
                '&:disabled': {
                  opacity: 0.6,
                },
              }}
            >
              <Iconify icon="eva:undo-outline" width={16} height={16} />
            </Button>
          </Tooltip>
        ) : (
          // )
          <Tooltip title="Mark as Checked In">
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusToggle('checkedIn');
              }}
              disabled={isUpdating}
              sx={{
                height: '28px',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor:
                  theme.palette.mode === 'light'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(76, 175, 80, 0.2)',
                color: theme.palette.mode === 'light' ? '#4caf50' : '#81c784',
                border:
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(76, 175, 80, 0.3)'
                    : '1px solid rgba(76, 175, 80, 0.4)',
                fontWeight: 500,
                fontSize: '0.7rem',
                textTransform: 'none',
                minWidth: 'auto',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  bgcolor:
                    theme.palette.mode === 'light'
                      ? 'rgba(76, 175, 80, 0.15)'
                      : 'rgba(76, 175, 80, 0.3)',
                  border:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(76, 175, 80, 0.4)'
                      : '1px solid rgba(76, 175, 80, 0.5)',
                },
                '&:disabled': {
                  opacity: 0.6,
                },
              }}
            >
              <Iconify icon="eva:checkmark-circle-2-fill" width={16} height={16} />
            </Button>
          </Tooltip>
        )}

        {isUpdating && (
          <CircularProgress
            size={16}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

StatusCell.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  updateAttendees: PropTypes.func.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
};

export default function EventAttendee() {
  const { id } = useParams();
  const settings = useSettingsContext();
  const theme = useTheme();
  const router = useRouter();

  // Column width persistence
  const { getColumnWidths, setColumnWidths } = useDataGridColumnsStore();
  const gridId = `event-attendee-${id}`;

  // Theme-aware colors
  const textColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const borderColor = theme.palette.mode === 'light' ? '#eee' : '#333';
  const headerBgColor = theme.palette.mode === 'light' ? '#f8f8f8' : '#333';
  const paperBgColor = theme.palette.mode === 'light' ? '#fff' : '#1e1e1e';
  const hoverBgColor = theme.palette.mode === 'light' ? '#f8f9fa' : '#2c2c2c';
  const secondaryTextColor = theme.palette.mode === 'light' ? '#666' : '#aaa';

  const [selectedRows, setSelectedRows] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [page, setPage] = useState(1);
  const [statusUpdates, setStatusUpdates] = useState({});

  const [snackbar, setSnackbar] = useState(null);

  // Advanced filtering state
  const [filteredRows, setFilteredRows] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const apiRef = useGridApiRef();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [allAttendees, setAllAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const dialog = useBoolean();
  const { data, isLoading } = useSWR(`${endpoints.attendee.root}?eventId=${id}`, fetcher);

  // const fetchAttendees = useCallback(async () => {
  //   try {
  //     const response = await axiosInstance.get(`${endpoints.attendee.event.list}/${id}`);
  //     setAttendees(
  //       response.data?.attendee?.sort((a, b) => {
  //         if (a.checkedIn && !b.checkedIn) {
  //           return -1;
  //         }
  //         if (!a.checkedIn && b.checkedIn) {
  //           return 1;
  //         }
  //         return 0;
  //       })
  //     );
  //     setEvent(response?.data?.event);
  //   } catch (error) {
  //     toast.error('Error fetch attendees');
  //   }
  // }, [id]);

  useEffect(() => {
    if (selectedEventId) {
      const attendeesForSelectedEvent = allAttendees.filter(
        (attendee) => attendee.eventId === selectedEventId
      );
      setAttendees(attendeesForSelectedEvent);
    }
  }, [selectedEventId, allAttendees]);

  const updateAttendees = useCallback(async (newRow) => {
    try {
      await axiosInstance.patch(`/api/attendee/update/${newRow.id}`, newRow); // Add/remove /api if it doesnt work
      mutate();
      toast.success(`Successfully updated status: ${newRow.firstName} ${newRow.lastName}`);
      setSnackbar({ children: 'User successfully saved', severity: 'success' });
      return newRow;
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  }, []);

  const handleProcessRowUpdateError = useCallback((error) => {
    setSnackbar({ children: error.message, severity: 'error' });
  }, []);

  const handleStatusUpdate = useCallback((attendeeId, newStatus) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [attendeeId]: newStatus,
    }));
  }, []);

  // Initialize EventFilters
  const eventFilters = EventFilters({
    data,
    statusUpdates,
    onFilteredDataChange: setFilteredRows,
    isFilterExpanded,
    setIsFilterExpanded,
    eventId: id,
  });

  // Handle column resize
  const handleColumnResize = useCallback(
    (params) => {
      // console.log('Column resize event:', params);
      // Try different parameter structures
      if (params.field && params.width) {
        setColumnWidths(gridId, { [params.field]: params.width });
      } else if (params.colDef && params.colDef.field && params.width) {
        setColumnWidths(gridId, { [params.colDef.field]: params.width });
      }
    },
    [gridId, setColumnWidths]
  );

  // Handle state changes to detect column width changes
  const handleStateChange = useCallback(
    (state) => {
      // console.log('State change event:', state);
      if (state.columns && state.columns.dimensions) {
        const columnWidths = {};
        Object.entries(state.columns.dimensions).forEach(([field, dimension]) => {
          if (dimension.width) {
            columnWidths[field] = dimension.width;
          }
        });
        if (Object.keys(columnWidths).length > 0) {
          setColumnWidths(gridId, columnWidths);
        }
      }
    },
    [gridId, setColumnWidths]
  );

  // Get persisted column widths
  const persistedWidths = getColumnWidths(gridId);

  // Ajust the width  or use the slide to give more screen realestate
  const columns = [
    {
      field: 'fullName',
      headerName: 'Attendee Name',
      width: persistedWidths.fullName || 250,
      // editable: true,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            width: '100%',
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: textColor,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {`${params.row.firstName || ''} ${params.row.lastName || ''}`}
          </Typography>

          <Tooltip title="View Order Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(paths.dashboard.order.details(params.row.order.id));
              }}
              sx={{
                width: 28,
                height: 28,
                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                border: '1px solid #eee',
                flexShrink: 0,
                '&:hover': {
                  bgcolor:
                    theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.04)'
                      : 'rgba(255, 255, 255, 0.08)',
                  color: theme.palette.mode === 'light' ? '#111' : '#fff',
                },
              }}
            >
              <Iconify icon="eva:file-text-outline" width={16} height={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: persistedWidths.status || 190,
      editable: false,
      renderCell: (params) => (
        <StatusCell
          params={params}
          updateAttendees={updateAttendees}
          onStatusUpdate={handleStatusUpdate}
        />
      ),
    },
    {
      field: 'email',
      headerName: 'Attendee Email',
      width: persistedWidths.email || 200,
      editable: true,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: persistedWidths.category || 200,
      editable: true,
      valueGetter: (value, row) => `${row.category || 'N/A'}`,
    },
    {
      field: 'phoneNumber',
      headerName: 'Attendee Phone Number',
      width: persistedWidths.phoneNumber || 200,
      editable: true,
    },
    {
      field: 'companyName',
      headerName: 'Company Name',
      width: persistedWidths.companyName || 200,
      editable: true,
      renderCell: (params) => {
        if (params.value) {
          return params.value;
        }
        return 'No company';
      },
    },
    {
      field: 'ticketType',
      headerName: 'Ticket Type',
      width: persistedWidths.ticketType || 200,
      valueGetter: (value, row) => `${row.ticket.ticketType.title || ''}`,
    },
    {
      field: 'ticketAddOn',
      headerName: 'Ticket Add On',
      width: persistedWidths.ticketAddOn || 200,
      valueGetter: (value, row) => `${row.ticket.ticketAddOn?.addOn?.name || 'N/A'}`,
    },
    {
      field: 'ticketCode',
      headerName: 'Ticket Code',
      width: persistedWidths.ticketCode || 200,
      valueGetter: (value, row) => `${row.ticket.ticketCode || ''}`,
    },
    {
      field: 'orderNumber',
      headerName: 'Order Number',
      width: persistedWidths.orderNumber || 200,
      valueGetter: (value, row) => `${row.order.orderNumber || ''}`,
    },
    {
      field: 'orderStatus',
      headerName: 'Order Status',
      width: persistedWidths.orderStatus || 150,
      valueGetter: (value, row) => {
        // Check if the order is free (paid with 0 amount)
        if (row.order.status === 'paid' && Number(row.order.totalAmount) === 0) {
          return 'free';
        }
        return `${row.order.status || ''}`;
      },
      renderCell: (params) => {
        const status = params.value;

        let displayText = 'Unknown';
        if (status === 'free') {
          displayText = 'Free';
        } else if (status) {
          displayText = status.charAt(0).toUpperCase() + status.slice(1);
        }

        // Get icon and icon color based on status
        let icon;
        let iconColor;

        switch (status) {
          case 'paid':
            icon = 'eva:checkmark-circle-2-fill';
            iconColor = '#229A16';
            break;
          case 'pending':
            icon = 'eva:clock-outline';
            iconColor = '#B78103';
            break;
          case 'cancelled':
          case 'failed':
            icon = 'eva:close-circle-fill';
            iconColor = '#B72136';
            break;
          case 'free':
            icon = 'eva:gift-outline';
            iconColor = '#2196F3';
            break;
          default:
            icon = 'eva:question-mark-circle-outline';
            iconColor = '#737373';
        }

        return (
          <Chip
            icon={<Iconify icon={icon} sx={{ width: 16, height: 16 }} />}
            label={displayText}
            size="small"
            sx={{
              height: 24,
              color: '#737373',
              bgcolor: 'transparent',
              border: '1px solid #E5E5E5',
              fontSize: 12,
              fontWeight: 600,
              width: 'fit-content',
              '&:hover': {
                color: '#737373',
                bgcolor: 'transparent',
                border: '1px solid #E5E5E5',
              },
              '& .MuiChip-icon': {
                color: iconColor,
                ml: 0.5,
              },
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        );
      },
    },
    {
      field: 'ticketStatus',
      headerName: 'Ticket Status',
      width: persistedWidths.ticketStatus || 130,
      valueGetter: (value, row) => {
        const ticketPrice = Number(row.ticket.price) || 0;
        const originalTicketPrice = Number(row.ticket.ticketType.price) || 0;
        const orderStatus = row.order.status;
        const orderAmount = Number(row.order.totalAmount) || 0;
        const discountAmount = Number(row.order.discountAmount) || 0;
        const { discountCode } = row.order;

        // If the original ticket type has no price, its free
        if (originalTicketPrice === 0) {
          return 'free';
        }

        // If order is not paid, use order status
        if (orderStatus !== 'paid') {
          return orderStatus || 'pending';
        }

        // For paid orders, check if ticket was discounted
        if (orderStatus === 'paid') {
          // If there's a discount code and discount amount > 0
          if (discountCode && discountAmount > 0) {
            // If order total is 0, everything was discounted to free
            if (orderAmount === 0) {
              return 'free';
            }

            // Calculate if ticket was fully discounted
            const addOnPrice = Number(row.ticket.ticketAddOn?.price) || 0;
            const totalBeforeDiscount = originalTicketPrice + addOnPrice;

            // If discount covers the full ticket price or more
            if (discountAmount >= originalTicketPrice) {
              return 'free';
            }

            // If discount is partial but covers some of the ticket
            if (discountAmount > 0 && discountAmount < originalTicketPrice) {
              return 'paid'; // Partially discounted but still paid
            }
          }

          // If no discount or ticket not covered by discount, it's paid
          return 'paid';
        }

        // Use order status for other cases
        return orderStatus || 'pending';
      },
      renderCell: (params) => {
        const status = params.value;

        let displayText = 'Unknown';
        if (status === 'free') {
          displayText = 'Free';
        } else if (status) {
          displayText = status.charAt(0).toUpperCase() + status.slice(1);
        }

        // Get icon and icon color based on status
        let icon;
        let iconColor;

        switch (status) {
          case 'paid':
            icon = 'eva:checkmark-circle-2-fill';
            iconColor = '#229A16';
            break;
          case 'pending':
            icon = 'eva:clock-outline';
            iconColor = '#B78103';
            break;
          case 'cancelled':
          case 'failed':
            icon = 'eva:close-circle-fill';
            iconColor = '#B72136';
            break;
          case 'free':
            icon = 'eva:gift-outline';
            iconColor = '#2196F3';
            break;
          default:
            icon = 'eva:question-mark-circle-outline';
            iconColor = '#737373';
        }

        return (
          <Chip
            icon={<Iconify icon={icon} sx={{ width: 16, height: 16 }} />}
            label={displayText}
            size="small"
            sx={{
              height: 24,
              color: '#737373',
              bgcolor: 'transparent',
              border: '1px solid #E5E5E5',
              fontSize: 12,
              fontWeight: 600,
              width: 'fit-content',
              '&:hover': {
                color: '#737373',
                bgcolor: 'transparent',
                border: '1px solid #E5E5E5',
              },
              '& .MuiChip-icon': {
                color: iconColor,
                ml: 0.5,
              },
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        );
      },
    },
    {
      field: 'addOnStatus',
      headerName: 'Add on Status',
      width: persistedWidths.addOnStatus || 130,
      valueGetter: (value, row) => {
        // Check if there's an add-on
        const { ticketAddOn } = row.ticket;

        if (!ticketAddOn && !ticketAddOn?.addOn) {
          return 'none';
        }

        const addOnPrice = Number(ticketAddOn.price) || 0;
        const originalAddOnPrice = Number(ticketAddOn.addOn?.price) || 0;
        const orderStatus = row.order.status;
        const orderAmount = Number(row.order.totalAmount) || 0;
        const discountAmount = Number(row.order.discountAmount) || 0;

        // If the original add-on has no price, its free
        if (originalAddOnPrice === 0) {
          return 'free';
        }

        // If the add-on price stored in ticketAddOn is 0 but original price > 0, it was discounted
        if (addOnPrice === 0 && originalAddOnPrice > 0) {
          return 'free';
        }

        // For add-ons, since discounts typically only apply to ticket types (not add-ons),
        // we need to determine if the add-on was actually paid for
        if (orderStatus === 'paid') {
          const originalTicketPrice = Number(row.ticket.ticketType.price) || 0;
          const { discountCode } = row.order;

          // If order total is 0 but there's a discount, determine what was discounted
          if (orderAmount === 0 && discountAmount > 0) {
            // Calculate what the total should be without discount
            const totalWithoutDiscount = originalTicketPrice + originalAddOnPrice;

            // If discount amount equals or exceeds the total, everything was discounted
            if (discountAmount >= totalWithoutDiscount) {
              return 'free';
            }

            // If discount only covers the ticket price, add-on was paid
            if (discountAmount >= originalTicketPrice && discountAmount < totalWithoutDiscount) {
              return 'paid';
            }

            // If discount is partial and less than ticket price, add-on wasn't discounted
            if (discountAmount < originalTicketPrice) {
              return 'paid';
            }
          }

          // If order has amount > 0, the add-on was paid (since it has price)
          if (orderAmount > 0 && originalAddOnPrice > 0) {
            return 'paid';
          }

          // If add-on has no original price, it's free
          if (originalAddOnPrice === 0) {
            return 'free';
          }
        }

        // Use order status for other cases
        return orderStatus || 'pending';
      },
      renderCell: (params) => {
        const status = params.value;

        let displayText = 'Unknown';
        if (status === 'none') {
          displayText = 'None';
        } else if (status === 'free') {
          displayText = 'Free';
        } else if (status) {
          displayText = status.charAt(0).toUpperCase() + status.slice(1);
        }

        // Get icon and icon color based on status
        let icon;
        let iconColor;

        switch (status) {
          case 'paid':
            icon = 'eva:checkmark-circle-2-fill';
            iconColor = '#229A16';
            break;
          case 'pending':
            icon = 'eva:clock-outline';
            iconColor = '#B78103';
            break;
          case 'cancelled':
          case 'failed':
            icon = 'eva:close-circle-fill';
            iconColor = '#B72136';
            break;
          case 'free':
            icon = 'eva:gift-outline';
            iconColor = '#2196F3';
            break;
          case 'none':
            icon = 'eva:minus-circle-outline';
            iconColor = '#737373';
            break;
          default:
            icon = 'eva:question-mark-circle-outline';
            iconColor = '#737373';
        }

        return (
          <Chip
            icon={<Iconify icon={icon} sx={{ width: 16, height: 16 }} />}
            label={displayText}
            size="small"
            sx={{
              height: 24,
              color: '#737373',
              bgcolor: 'transparent',
              border: '1px solid #E5E5E5',
              fontSize: 12,
              fontWeight: 600,
              width: 'fit-content',
              '&:hover': {
                color: '#737373',
                bgcolor: 'transparent',
                border: '1px solid #E5E5E5',
              },
              '& .MuiChip-icon': {
                color: iconColor,
                ml: 0.5,
              },
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        );
      },
    },
    {
      field: 'orderAmount',
      headerName: 'Order Amount',
      width: persistedWidths.orderAmount || 200,
      valueGetter: (value, row) => `RM${(row.order.totalAmount || 0).toFixed(2)}`,
    },
    {
      field: 'discountCode',
      headerName: 'Discount Code',
      width: persistedWidths.discountCode || 150,
      valueGetter: (value, row) => (row.order.discountCode ? row.order.discountCode.code : 'None'),
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        {/* Back Button + Breadcrumb Navigation */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
            flex: 1,
            minWidth: 0,
          }}
        >
          <Tooltip title={`Back to ${data?.event?.name || 'Event'}`}>
            <IconButton
              onClick={() => router.push(paths.dashboard.events.details(id))}
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                border: `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : '#444'}`,
                borderRadius: 1,
                flexShrink: 0,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#333',
                  color: theme.palette.mode === 'light' ? '#333' : '#fff',
                  borderColor: theme.palette.mode === 'light' ? '#ccc' : '#666',
                },
              }}
            >
              <Iconify
                icon="eva:arrow-back-fill"
                width={{ xs: 18, sm: 20 }}
                height={{ xs: 18, sm: 20 }}
              />
            </IconButton>
          </Tooltip>

          <Typography
            variant="body1"
            onClick={() => router.push(paths.dashboard.events.details(id))}
            sx={{
              color: theme.palette.mode === 'light' ? '#666' : '#aaa',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: { xs: '120px', sm: '200px', md: 'none' },
              '&:hover': {
                color: theme.palette.mode === 'light' ? '#333' : '#ccc',
                textDecoration: 'underline',
              },
            }}
          >
            {data?.event?.name || 'Event'}
          </Typography>

          <Iconify
            icon="eva:chevron-right-fill"
            sx={{
              color: theme.palette.mode === 'light' ? '#ccc' : '#555',
              width: { xs: 16, sm: 18 },
              height: { xs: 16, sm: 18 },
              flexShrink: 0,
            }}
          />

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.mode === 'light' ? '#111' : '#fff',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Attendees
          </Typography>
        </Box>

        {/* Add Attendee Button */}
        <Box sx={{ flexShrink: 0 }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="material-symbols:add" />}
            onClick={dialog.onTrue}
            sx={{
              borderRadius: 1,
              fontWeight: 600,
              boxShadow: 'none',
              bgcolor: theme.palette.mode === 'light' ? '#111' : '#eee',
              color: theme.palette.mode === 'light' ? '#fff' : '#111',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              height: { xs: 36, sm: 40 },
              '&:hover': {
                bgcolor: theme.palette.mode === 'light' ? '#222' : '#ddd',
                boxShadow: 'none',
              },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0.5, sm: 1 },
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Add Attendee
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Add
            </Box>
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: paperBgColor,
        }}
      >
        {eventFilters.FilterSection()}

        <DataGrid
          editMode="row"
          apiRef={apiRef}
          rows={filteredRows}
          columns={columns}
          pagination
          pageSize={10}
          checkboxSelection
          disableSelectionOnClick
          selectionModel={selectedRows}
          onPageChange={(newPage) => setPage(newPage)}
          onColumnResize={handleColumnResize}
          onColumnResizeCommit={handleColumnResize}
          onStateChange={handleStateChange}
          autoHeight
          showToolbar
          initialState={{
            columns: {
              columnVisibilityModel: {
                orderNumber: false,
                ticketType: false,
                ticketAddOn: false,
                ticketCode: false,
                ticketStatus: false,
                addOnStatus: false,
              },
            },
          }}
          processRowUpdate={(newRow, oldRow) => {
            if (JSON.stringify(newRow) === JSON.stringify(oldRow)) {
              return oldRow;
            }

            return updateAttendees(newRow);
          }}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          slots={{
            toolbar: eventFilters.CustomToolbar,
          }}
          sx={{
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#f3f3f3' : '#333'}`,
              borderRight: `1px solid ${theme.palette.mode === 'light' ? '#f3f3f3' : '#333'}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: headerBgColor,
              borderBottom: 'none',
            },
            '& .MuiDataGrid-columnHeader': {
              color: textColor,
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRight: `1px solid ${theme.palette.mode === 'light' ? '#f3f3f3' : '#333'}`,
            },
            '& .MuiDataGrid-columnHeader:last-child': {
              borderRight: 'none',
            },
            '& .MuiDataGrid-cell:last-child': {
              borderRight: 'none',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: paperBgColor,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${theme.palette.mode === 'light' ? '#f3f3f3' : '#333'}`,
              backgroundColor: paperBgColor,
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: '8px 16px',
              backgroundColor: paperBgColor,
              borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#f3f3f3' : '#333'}`,
            },
            '& .MuiButton-root': {
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1,
            },
            '& .MuiFormControl-root': {
              minWidth: 120,
            },
            '& .MuiTablePagination-root': {
              color: secondaryTextColor,
            },
            '& .MuiIconButton-root': {
              color: secondaryTextColor,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: hoverBgColor,
            },
          }}
        />
      </Paper>

      <Dialog
        open={dialog.value}
        onClose={dialog.onFalse}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: paperBgColor,
          },
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2, color: textColor }}> Add Attendee Information</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <CreateAttendeeForm dialog={dialog} selectedEventId={id} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
