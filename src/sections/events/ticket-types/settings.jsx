import React, { useState } from 'react';

import {
  Table,
  Button,
  Dialog,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
} from '@mui/material';

const TicketTypesPage = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [ticketName, setTicketName] = useState('');
  const [editId, setEditId] = useState(null);

  const handleOpen = (ticket = null) => {
    setEditId(ticket ? ticket.id : null);
    setTicketName(ticket ? ticket.name : '');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = () => {
    if (ticketName.trim() === '') return;
    if (editId) {
      setTicketTypes(ticketTypes.map(t => (t.id === editId ? { id: editId, name: ticketName } : t)));
    } else {
      setTicketTypes([...ticketTypes, { id: Date.now(), name: ticketName }]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setTicketTypes(ticketTypes.filter(t => t.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ width: '80%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Ticket Type Management</h1>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Create New Ticket Type
        </Button>
      </div>

      <TableContainer
        sx={{
          width: '80%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Table
          sx={{
            borderCollapse: 'collapse',
            '& td, & th': { borderBottom: '1px solid rgba(255, 255, 255, 0.2)' },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketTypes.length > 0 ? (
              ticketTypes.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.name}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleOpen(ticket)} sx={{ marginRight: '8px' }}>Edit</Button>
                    <Button size="small" variant="contained" color="error" onClick={() => handleDelete(ticket.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ fontStyle: 'italic', color: 'gray' }}>
                  No Data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Edit' : 'Create'} Ticket Type</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ticket Name"
            value={ticketName}
            onChange={(e) => setTicketName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'gray' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TicketTypesPage;