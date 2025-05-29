/* eslint-disable no-unused-vars */
// import { toast } from 'react-toastify';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
/* eslint-disable consistent-return */
import { useParams } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Button,
  Dialog,
  Tooltip,
  Checkbox,
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

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CreateAttendeeForm from 'src/components/modalAdd/attendeeform';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function EventAttendee() {
  const { id } = useParams();
  const settings = useSettingsContext();
  const theme = useTheme();
  const router = useRouter();
  
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

  const [snackbar, setSnackbar] = useState(null);
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
      toast.success(`Attendee ${newRow.firstName} ${newRow.lastName} successfully saved.`);
      setSnackbar({ children: 'User successfully saved', severity: 'success' });
      return newRow;
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  }, []);

  const handleProcessRowUpdateError = useCallback((error) => {
    setSnackbar({ children: error.message, severity: 'error' });
  }, []);

  // Ajust the width  or use the slide to give more screen realestate
  const columns = [
    {
      field: 'fullName',
      headerName: 'Attendee Name',
      width: 200,
      // editable: true,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
    { field: 'email', headerName: 'Attendee Email', width: 200, editable: true },
    { field: 'phoneNumber', headerName: 'Attendee Phone Number', width: 200, editable: true },
    {
      field: 'orderNumber',
      headerName: 'Order Number',
      width: 200,
      valueGetter: (value, row) => `${row.order.orderNumber || ''}`,
    },
    {
      field: 'companyName',
      headerName: 'Company Name',
      width: 200,
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
      width: 200,
      valueGetter: (value, row) => `${row.ticket.ticketType.title || ''}`,
    },
    {
      field: 'ticketCode',
      headerName: 'Ticket Code',
      width: 200,
      valueGetter: (value, row) => `${row.ticket.ticketCode || ''}`,
    },
    {
      field: 'orderStatus',
      headerName: 'Order Type',
      width: 150,
      valueGetter: (value, row) => {
        // Check if the order is free (paid with 0 amount)
        if (row.order.status === 'paid' && Number(row.order.totalAmount) === 0) {
          return 'free';
        }
        return `${row.order.status || ''}`;
      },
      renderCell: (params) => {
        const status = params.value;
        let color;
        
        switch (status) {
          case 'paid':
            color = 'success';
            break;
          case 'pending':
            color = 'warning';
            break;
          case 'cancelled':
            color = 'error';
            break;
          case 'failed':
            color = 'error';
            break;
          case 'free':
            color = 'info';
            break;
          default:
            color = 'default';
        }
        
        let displayText = 'Unknown';
        if (status === 'free') {
          displayText = 'Free';
        } else if (status) {
          displayText = status.charAt(0).toUpperCase() + status.slice(1);
        }
        
        return (
          <Label size="small" color={color}>
            {displayText}
          </Label>
        );
      },
    },
    {
      field: 'discountCode',
      headerName: 'Discount Code',
      width: 150,
      valueGetter: (value, row) => (row.order.discountCode ? row.order.discountCode.code : 'None'),
    },
    {
      field: 'status',
      headerName: 'Checked In',
      width: 150,
      editable: true,
      type: 'boolean',
      renderCell: (params) =>
        params.value === 'pending' ? (
          <Tooltip title="Click to edit status">
            <Label size="small" color="warning">
              Pending
            </Label>
          </Tooltip>
        ) : (
          <Label size="small" color="success">
            Checked In
          </Label>
        ),
      renderEditCell: (params) => (
        <Checkbox
          checked={params.value === 'checkedIn'}
          onChange={(e) => {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: e.target.checked ? 'checkedIn' : 'pending',
            });
          }}
        />
      ),
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Tooltip title={`Back to ${data?.event?.name || 'Event'}`}>
          <IconButton
            onClick={() => router.push(paths.dashboard.events.details(id))}
            sx={{
              width: 40,
              height: 40,
              color: theme.palette.mode === 'light' ? 'grey.800' : 'common.white',
              '&:hover': {
                bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
              },
            }}
          >
            <Iconify icon="eva:arrow-back-fill" width={20} height={20} />
          </IconButton>
        </Tooltip>

        <Typography variant="h4" sx={{ color: theme.palette.mode === 'light' ? 'grey.800' : 'common.white' }}>
          Attendees
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

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
            '&:hover': {
              bgcolor: theme.palette.mode === 'light' ? '#222' : '#ddd',
              boxShadow: 'none',
            },
          }}
        >
          New Attendee
        </Button>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          border: `1px solid ${borderColor}`, 
          borderRadius: 2, 
          overflow: 'hidden',
          bgcolor: paperBgColor
        }}
      >
        <DataGrid
          editMode="row"
          apiRef={apiRef}
          rows={data?.attendees || []}
          columns={columns}
          pagination
          pageSize={10}
          checkboxSelection
          disableSelectionOnClick
          selectionModel={selectedRows}
          onPageChange={(newPage) => setPage(newPage)}
          autoHeight
          processRowUpdate={(newRow, oldRow) => {
            if (JSON.stringify(newRow) === JSON.stringify(oldRow)) {
              return oldRow;
            }

            return updateAttendees(newRow);
          }}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          sx={{
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#f3f3f3' : '#333'}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: headerBgColor,
              borderBottom: 'none',
            },
            '& .MuiDataGrid-columnHeader': {
              color: textColor,
              fontWeight: 600,
              fontSize: '0.875rem',
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
          <CreateAttendeeForm dialog={dialog} selectedEventId={event?.id} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
