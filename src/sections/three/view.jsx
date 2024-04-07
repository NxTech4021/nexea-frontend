import React, { useState, useEffect } from 'react';
import axios from 'axios'
import AddIcon from '@mui/icons-material/Add';
import TableSortLabel from '@mui/material/TableSortLabel';
import {
  Chip,
  Table,
  Paper,
  Stack,
  Divider,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  Pagination,
  TableContainer,
  Container,
  Dialog, 
  DialogTitle, 
  DialogContent, 
} from '@mui/material';

import employee from 'src/_mock/startupsDatabase.users.json';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CreateAttendeeForm from 'src/components/modalAdd/attendeeform';

// ----------------------------------------------------------------------

export const DeleteSelectedAttendees = async () => {
  const [selected, setSelected] = useState([]);
  const [attendees, setAttendees] = useState([]);
  try {
     // Assuming your backend endpoint is something like /api/attendee/delete
     const response = await axios.post('http://localhost:3001/api/attendee/delete', {
       ids: selected, // Send the IDs of the selected attendees
     });
 
     if (response.status === 200) {
       // Assuming the backend returns the updated list of attendees
       setAttendees(response.data);
       setSelected([]); // Clear the selection
       alert('Selected attendees deleted successfully!');
     }
  } catch (error) {
     console.error('Error deleting attendees:', error);
  }
 };
 

export default function Attendees() {
  const settings = useSettingsContext();
  //  const [checkAll, setCheckAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleChange = (event, value) => {
    setPage(value);
  };


 useEffect(() => {
  const fetchAttendees = async () => {
    try {
      const response = await axios.get('http://localhost:3001/attendees');
      setAttendees(response.data);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  fetchAttendees();
}, []);



  const data = employee;
  //   const [check, setCheck] = useState(false);

  // Old selections 

  // const onSelectRow = (i) => {
  //   const newSelected = selected.includes(i)
  //     ? selected.filter((value) => value !== i)
  //     : [...selected, i];

  //   setSelected(newSelected);
  // };

  const onSelectAllRow = () => {
    const index = data;
    const t = [];
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      index.forEach((element) => {
        t.push(element.email);
      });
      setSelected(t);
    }
  };

  // Selections Updated 
  const onSelectRow = (id) => {
    const newSelected = selected.includes(id)
       ? selected.filter((value) => value !== id)
       : [...selected, id];
   
    setSelected(newSelected);
   };
   
  

  const head = (
    <TableHead>
      <TableRow>
        <TableCell>
          {selected.length > 0 ? (
            <Checkbox
              icon={<Iconify icon="carbon:checkbox-indeterminate-filled" />}
              sx={{
                color: 'success.main',
                bgcolor: 'success.main',
              }}
              onClick={onSelectAllRow}
            />
          ) : (
            <Checkbox onClick={onSelectAllRow} checked={selected.length === data.length} />
          )}
        </TableCell>
        <TableCell>
          <TableSortLabel>First Name</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Last Name</TableSortLabel>
          </TableCell>
        <TableCell>
          <TableSortLabel>Name</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Order Number</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Ticket Total</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Discount Code</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Ticket Code</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Ticket ID</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Ticket Type</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Buyer First Name</TableSortLabel>
        </TableCell>
        <TableCell> 
          <TableSortLabel>Buyer Last Name</TableSortLabel> 
        </TableCell>
        <TableCell>
          <TableSortLabel>Buyer Email.</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Phone Number</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Company Name</TableSortLabel>
        </TableCell>

        <TableCell>
          <TableSortLabel>Attendance</TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );

  const body = attendees.slice(6 * page - 6, 6 * page).map((item, i) => (
    <TableBody>
      <TableRow key={i}>
        {/* <TableCell>
          <Checkbox
            id={i}
            onClick={() => onSelectRow(item.email)}
            checked={selected.includes(item.email)}
          />
        </TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>{item.position}</TableCell> */}
        <TableCell>
          <Checkbox
            id={i}
            onClick={() => onSelectRow(item.email)}
            checked={selected.includes(item.email)}
          />
        </TableCell>
        <TableCell>{item.firstName}</TableCell>
        <TableCell>{item.lastName}</TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.orderNumber}</TableCell>
        <TableCell>{item.ticketTotal}</TableCell>
        <TableCell>{item.discountCode}</TableCell>
        <TableCell>{item.ticketCode}</TableCell>
        <TableCell>{item.ticketID}</TableCell>
        <TableCell>{item.ticketType}</TableCell>
        <TableCell>{item.buyerFirstName}</TableCell>
        <TableCell>{item.buyerEmail}</TableCell>
        <TableCell>{item.phoneNumber}</TableCell>
        <TableCell>{item.companyName}</TableCell>
        <TableCell>{item.buyerLastName}</TableCell>
        <TableCell>
          {item.verified ? (
            <Chip label="Attended" variant="outlined" color="primary" />
          ) : (
            <Chip label="Not Attended" variant="outlined" color="error" />
          )}
        </TableCell>
        <TableCell>
        {selected.includes(item.email) && (
          <IconButton onClick={() => DeleteSelectedAttendees(item.email)}>
            <Iconify icon="ic:outline-delete" width={24} />
          </IconButton>
        )}
      </TableCell>
      </TableRow>
    </TableBody>
  ));

  return (
   <>
   <Container  maxWidth={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }} >
      <Typography variant="h4"> Attendees</Typography>
    </Container>  

  <Container maxWidth ={settings.themeStretch ? false : 'xl'} sx={{ marginBottom: 4 }}>
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
  {/* <IconButton>
    {/* <SearchIcon /> 
  </IconButton> */}
  <input type="text" placeholder="Search..." style={{ marginLeft: '8px' }} />
  </div>

    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
      <IconButton>
        <AddIcon />
      </IconButton>
      <IconButton onClick={handleModalOpen}>
        <AddIcon />
      </IconButton>
    </div>
  </div>

  <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle > Add Attendee Information</DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <CreateAttendeeForm/>
        </DialogContent>
  </Dialog>
  </Container>

    <Stack>

      <TableContainer component={Paper} sx={{ position: 'relative' }}>
        {selected.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              pl: 2,
              pr: 2,
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9,
              height: 70,
              position: 'absolute',
              bgcolor: 'primary.lighter',
              color: 'success.dark',
            }}
            gap={3}
          >
            <Checkbox
              icon={<Iconify icon="carbon:checkbox-indeterminate-filled" />}
              sx={{
                color: 'success.main',
              }}
              onClick={onSelectAllRow}
              checked={selected.length === data.length}
            />
            <Typography fontWeight={500}>{selected.length} selected</Typography>
            <IconButton sx={{ ml: 'auto', color: (theme) => theme.palette.success.dark }}>
              <Iconify icon="ic:outline-delete" width={24} />
            </IconButton>
          </Stack>
        )}
        <Scrollbar>
          <Table size="medium">
            {head}
            {body}
          </Table>
        </Scrollbar>
      </TableContainer>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Pagination
        size="small"
        count={Math.floor(data.length / 5)}
        sx={{ p: 3, display: 'flex', justifyContent: { xs: 'center', lg: 'end' } }}
        onChange={handleChange}
      />
    </Stack>

  </>
  );
}
