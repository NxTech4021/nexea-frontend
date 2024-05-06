/* eslint-disable no-unused-vars */
import { toast } from 'react-toastify';
/* eslint-disable consistent-return */
import { useParams } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';

import { Box, Container, Typography } from '@mui/material';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';

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
  const [menuOptions, setMenuOptions] = useState([]);
  // To select the event in the menu item
  const [selectedEvent, setSelectedEvent] = useState('');
  // To filter to attendees data when an event is selected
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [allAttendees, setAllAttendees] = useState([]);

  const fetchAttendees = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.attendee.event.list}/${id}`);
      setAttendees(response.data);
    } catch (error) {
      console.error('Error fetching all attendees:', error);
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
        toast.success('User successfully saved.');
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
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'firstName', headerName: 'First Name', width: 120, editable: true },
    { field: 'lastName', headerName: 'Last Name', width: 120, editable: true },
    { field: 'name', headerName: 'Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 120, editable: true },
    { field: 'discountCode', headerName: 'Discount Code' },
    { field: 'ticketCode', headerName: 'Ticket Code' },
    { field: 'checkedIn', headerName: 'Attendance' },
    { field: 'orderNumber', headerName: 'Order Number' },
    { field: 'ticketTotal', headerName: 'Ticket Total' },
    { field: 'ticketID', headerName: 'Ticket ID' },
    { field: 'ticketType', headerName: 'Ticket Type' },
    { field: 'buyerFirstName', headerName: 'Buyer First Name', width: 120, editable: true },
    { field: 'buyerLastName', headerName: 'Buyer Last Name', width: 120, editable: true },
    { field: 'buyerName', headerName: 'Buyer Name', width: 120, editable: true },
    { field: 'buyerEmail', headerName: 'Buyer Email', width: 120 },
    { field: 'phoneNumber', headerName: 'Phone Number', editable: true },
    { field: 'companyName', headerName: 'Company Name', editable: true },
  ];

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
        <Typography variant="h4">Attendees</Typography>
      </Container>

      <Box sx={{ height: 400, width: '100%' }}>
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
    </>
  );
}
