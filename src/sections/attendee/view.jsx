/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
import { toast } from 'react-toastify';
import { useParams } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import {
  Box,
  Alert,
  Dialog,
  Button,
  Select,
  Snackbar,
  MenuItem,
  Container,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CreateAttendeeForm from 'src/components/modalAdd/attendeeform';

// ----------------------------------------------------------------------

export default function Attendees() {
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

  const [clickedEvent, setClickedEvent] = useState('false');

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get(endpoints.events.list);
      const eventsArray = response.data.events;
      const options = eventsArray.map((event) => ({
        label: event.name,
        value: event.id,
      }));
      setMenuOptions(options);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchAttendees = async () => {
    try {
      const response = await axiosInstance.get(endpoints.attendee.list);
      setAllAttendees(response.data);
    } catch (error) {
      console.error('Error fetching all attendees:', error);
    }
  };

  const handleMenuSelect = (event) => {
    const eventId = event.target.value;
    const selectedEventName = menuOptions.find((option) => option.value === eventId)?.label;
    setSelectedEvent(selectedEventName);
    setSelectedEventId(eventId);
    setClickedEvent(true);
  };

  useEffect(() => {
    if (selectedEventId) {
      const attendeesForSelectedEvent = allAttendees.filter(
        (attendee) => attendee.eventId === selectedEventId
      );
      setAttendees(attendeesForSelectedEvent);
    }
  }, [selectedEventId, allAttendees]);

  const handleModalOpen = () => {
    if (!selectedEventId) {
      toast.warning('Please choose the event first.');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const updateAttendees = useCallback(async (newRow) => {
    try {
      await axiosInstance.patch(`/api/attendee/update/${newRow.id}`, newRow); // Add/remove /api if it doesnt work
      fetchAttendees();
      setSnackbar({ children: 'User successfully saved', severity: 'success' });
      return newRow;
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  }, []);

  const handleProcessRowUpdateError = useCallback((error) => {
    setSnackbar({ children: error.message, severity: 'error' });
  }, []);

  useEffect(() => {
    fetchAttendees();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents();
    fetchAttendees();
    return () => {
      controller.abort();
    };
  }, []);

  // Ajust the width  or use the slide to give more screen realestate
  const columns = [
    { field: 'attendeeFullName', headerName: 'Attendee Name', width: 200, editable: true },
    { field: 'attendeeEmail', headerName: 'Attendee Email', width: 200, editable: true },
    { field: 'orderNumber', headerName: 'Order Number', width: 200 },
    { field: 'companyName', headerName: 'Company Name', width: 200, editable: true },
    { field: 'ticketCode', headerName: 'Ticket Code', width: 200 },
    { field: 'checkedIn', headerName: 'Checked In', width: 100, editable: true },
  ];

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
        <Typography variant="h4">Attendees</Typography>
      </Container>

      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
        <div
          key={selectedEventId}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Select
            value={selectedEvent}
            onChange={handleMenuSelect}
            variant="outlined"
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography variant="body2" color="textSecondary">
                    Select Event
                  </Typography>
                );
              }
              return selected;
            }}
          >
            {menuOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          <Button onClick={handleModalOpen} endIcon={<Iconify icon="material-symbols:add" />}>
            Create
          </Button>
        </div>

        <Dialog open={isModalOpen} onClose={handleModalClose}>
          <DialogTitle> Add Attendee Information</DialogTitle>
          <DialogContent sx={{ py: 4 }}>
            <CreateAttendeeForm
              setIsModalOpen={setIsModalOpen}
              fetchAttendees={fetchAttendees}
              selectedEventId={selectedEventId}
            />
          </DialogContent>
        </Dialog>
      </Container>

      {/* Attendees Table  */}
      {selectedEvent ? (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            editMode="row"
            apiRef={apiRef}
            rows={attendees.filter((attendee) => attendee.eventId === selectedEventId)} // Filtered attendees based on selected event
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
          {!!snackbar && (
            <Snackbar
              open
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              onClose={() => setSnackbar(null)}
              autoHideDuration={6000}
            >
              <Alert icon={<CheckIcon fontSize="inherit" />} {...snackbar} />
            </Snackbar>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh', // Adjust height as needed
          }}
        >
          <Typography>Please Select an event to display Attendees</Typography>
        </Box>
      )}
    </>
  );
}
