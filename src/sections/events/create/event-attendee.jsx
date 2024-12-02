/* eslint-disable no-unused-vars */
import { toast } from 'react-toastify';
/* eslint-disable consistent-return */
import { useParams } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';

import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import { Box, Chip, Button, Dialog, Container, DialogTitle, DialogContent } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CreateAttendeeForm from 'src/components/modalAdd/attendeeform';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function EventAttendee() {
  const { id } = useParams();
  const settings = useSettingsContext();
  const [selectedRows, setSelectedRows] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const apiRef = useGridApiRef();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [allAttendees, setAllAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const dialog = useBoolean();

  const fetchAttendees = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.attendee.event.list}/${id}`);
      setAttendees(
        response.data?.attendee?.sort((a, b) => {
          if (a.checkedIn && !b.checkedIn) {
            return -1;
          }
          if (!a.checkedIn && b.checkedIn) {
            return 1;
          }
          return 0;
        })
      );
      setEvent(response?.data?.event);
    } catch (error) {
      toast.error('Error fetch attendees');
    }
  }, [id]);

  useEffect(() => {
    if (selectedEventId) {
      const attendeesForSelectedEvent = allAttendees.filter(
        (attendee) => attendee.eventId === selectedEventId
      );
      setAttendees(attendeesForSelectedEvent);
    }
  }, [selectedEventId, allAttendees]);

  const updateAttendees = useCallback(
    async (newRow) => {
      try {
        await axiosInstance.patch(`/api/attendee/update/${newRow.id}`, newRow); // Add/remove /api if it doesnt work
        fetchAttendees();
        toast.success(`Attendee ${newRow.buyerFullName} successfully saved.`);
        setSnackbar({ children: 'User successfully saved', severity: 'success' });
        return newRow;
      } catch (error) {
        console.error('Error fetching attendees:', error);
      }
    },
    [fetchAttendees]
  );

  const handleProcessRowUpdateError = useCallback((error) => {
    setSnackbar({ children: error.message, severity: 'error' });
  }, []);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAttendees();
    return () => {
      controller.abort();
    };
  }, [fetchAttendees]);

  // Ajust the width  or use the slide to give more screen realestate
  const columns = [
    { field: 'attendeeFullName', headerName: 'Attendee Name', width: 200, editable: true },
    { field: 'attendeeEmail', headerName: 'Attendee Email', width: 200, editable: true },
    { field: 'phoneNumber', headerName: 'Attendee Phone Number', width: 200, editable: true },
    {
      field: 'orderNumber',
      headerName: 'Order Number',
      width: 200,
      renderCell: (params) => {
        if (params.value) {
          return params.value;
        }
        return 'No order number';
      },
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
      renderCell: (params) => {
        if (params.value) {
          return params.value;
        }
        return 'No ticket type.';
      },
    },
    {
      field: 'ticketCode',
      headerName: 'Ticket Code',
      width: 200,
      renderCell: (params) => {
        if (params.value) {
          return params.value;
        }
        return 'No ticket code.';
      },
    },
    {
      field: 'checkedIn',
      headerName: 'Checked In',
      width: 150,
      editable: true,
      renderCell: (params) =>
        !params.value ? (
          <Chip size="small" label="Pending" color="warning" />
        ) : (
          <Chip size="small" label="Checked In" color="success" />
        ),
    },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
      <CustomBreadcrumbs
        heading="Attendees"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: event?.name || 'Event',
            href: paths.dashboard.events.root,
          },
          { name: 'Attendees' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="material-symbols:add" />}
            onClick={dialog.onTrue}
          >
            New Attendee
          </Button>
        }
      />

      {/* <Stack direction="row" justifyContent="space-between">
        <Typography variant="h4">Attendees</Typography>
        <Button variant="outlined">New Attendee</Button>
      </Stack> */}

      <Box sx={{ height: 400, width: '100%', mt: 2 }}>
        <DataGrid
          editMode="row"
          apiRef={apiRef}
          rows={attendees} // Filtered attendees based on selected event
          columns={columns}
          pagination
          pageSize={5}
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
        />
      </Box>

      <Dialog open={dialog.value} onClose={dialog.onFalse}>
        <DialogTitle> Add Attendee Information</DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <CreateAttendeeForm
            dialog={dialog}
            fetchAttendees={fetchAttendees}
            selectedEventId={event?.id}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
