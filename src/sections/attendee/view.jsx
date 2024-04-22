/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import {
  Box,
  Alert,
  Dialog,
  Button,
  Snackbar,
  Container,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import axiosInstance from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CreateAttendeeForm from 'src/components/modalAdd/attendeeform';

// ----------------------------------------------------------------------

export default function Attendees() {
  const settings = useSettingsContext();
  //  const [checkAll, setCheckAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const apiRef = useGridApiRef();

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const fetchAttendees = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/attendees');
      setAttendees(response.data);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  }, []);

  const updateAttendees = useCallback(
    async (newRow) => {
      try {
        await axiosInstance.patch(`/api/attendee/update/${newRow.id}`, newRow);
        fetchAttendees();
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
    { field: 'orderNumber', headerName: 'Order Number' },
    { field: 'ticketTotal', headerName: 'Ticket Total' },
    { field: 'discountCode', headerName: 'Discount Code' },
    { field: 'ticketCode', headerName: 'Ticket Code' },
    { field: 'ticketID', headerName: 'Ticket ID' },
    { field: 'ticketType', headerName: 'Ticket Type' },
    { field: 'buyerFirstName', headerName: 'Buyer First Name', width: 120, editable: true },
    { field: 'buyerLastName', headerName: 'Buyer Last Name', width: 120, editable: true },
    { field: 'buyerEmail', headerName: 'Buyer Email', width: 120, editable: true },
    { field: 'phoneNumber', headerName: 'Phone Number', editable: true },
    { field: 'companyName', headerName: 'Company Name', editable: true },
    { field: 'attendance', headerName: 'Attendance', editable: true },
  ];

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
        <Typography variant="h4">Attendees</Typography>
      </Container>

      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}
          >
            <Button onClick={handleModalOpen} endIcon={<Iconify icon="material-symbols:add" />}>
              Create
            </Button>
          </div>
        </div>

        <Dialog open={isModalOpen} onClose={handleModalClose}>
          <DialogTitle> Add Attendee Information</DialogTitle>
          <DialogContent sx={{ py: 4 }}>
            <CreateAttendeeForm setIsModalOpen={setIsModalOpen} fetchAttendees={fetchAttendees} />
          </DialogContent>
        </Dialog>
      </Container>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          editMode="row"
          apiRef={apiRef}
          rows={attendees}
          columns={columns}
          pagination
          pageSize={5}
          checkboxSelection
          disableSelectionOnClick
          selectionModel={selected}
          onPageChange={(newPage) => setPage(newPage)}
          autoHeight
          // disableColumnMenu
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
    </>
  );
}
