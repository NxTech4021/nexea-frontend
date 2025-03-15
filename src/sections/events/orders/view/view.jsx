import {
    Box,
    Button,
    Card,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Tabs,
    TextField,
    Typography,
    TablePagination,
    Tab,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
  } from '@mui/material';
  
  import React, { useState } from 'react';
  import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
  import { TablePaginationCustom } from 'src/components/table';
  
  import { paths } from 'src/routes/paths';
  
  const orders = [
    {
      id: 'ORD123',
      eventName: 'Music Festival',
      attendeeName: 'John Doe',
      discountCode: 'SUMMER10',
      orderDate: '2025-03-06',
      status: 'Confirmed',
    },
    {
      id: 'ORD124',
      eventName: 'Tech Conference',
      attendeeName: 'Jane Smith',
      discountCode: 'TECH20',
      orderDate: '2025-03-05',
      status: 'Pending',
    },
    {
      id: 'ORD125',
      eventName: 'Art Expo',
      attendeeName: 'Alice Brown',
      discountCode: 'ART30',
      orderDate: '2025-03-04',
      status: 'Cancelled',
    },
    {
      id: 'ORD126',
      eventName: 'Food Carnival',
      attendeeName: 'Bob White',
      discountCode: 'FOOD15',
      orderDate: '2025-03-03',
      status: 'Confirmed',
    },
  ];
  const STATUS_TABS = ['All', 'Confirmed', 'Pending', 'Cancelled'];
  const EVENT_OPTIONS = ['All', ...new Set(orders.map((order) => order.eventName))];
  
  export default function OrderView() {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('All');
    const [eventFilter, setEventFilter] = useState('All');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
      eventName: '',
      attendeeName: '',
      discountCode: '',
      orderDate: '',
    });
  
    const filteredOrders = orders.filter(
      (order) =>
        (tab === 'All' || order.status === tab) &&
        (eventFilter === 'All' || order.eventName === eventFilter) &&
        (order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.eventName.toLowerCase().includes(search.toLowerCase()) ||
          order.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
          order.discountCode.toLowerCase().includes(search.toLowerCase()) ||
          order.status.toLowerCase().includes(search.toLowerCase()))
    );
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setNewOrder({ ...newOrder, [name]: value });
    };
  
    const handleCreateOrder = () => {
      const orderId = `ORD${Math.floor(100 + Math.random() * 900)}`;
      const status = 'Pending';
      const order = { id: orderId, status, ...newOrder };
      orders.unshift(order);
      setNewOrder({
        eventName: '',
        attendeeName: '',
        discountCode: '',
        orderDate: '',
      });
      setOpen(false);
    };
  
    return (
      <>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'left', sm: 'center' },
              mb: { xs: 3, md: 5 },
              gap: 1,
            }}
          >
            <CustomBreadcrumbs
              heading="Order View"
              links={[
                { name: 'Dashboard', href: paths.dashboard.root },
                { name: 'Order View' },
                { name: 'List' },
              ]}
            />
          </Box>
          <Card>
            <Box display="flex" justifyContent="space-between" alignItems="center" padding={2}>
              <TextField
                label="Search Orders"
                variant="outlined"
                fullWidth
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                sx={{ ml: 2, minWidth: 200 }}
              >
                {EVENT_OPTIONS.map((event) => (
                  <MenuItem key={event} value={event}>
                    {event}
                  </MenuItem>
                ))}
              </Select>
              <Button variant="contained" color="info" sx={{ ml: 2 }} onClick={handleClickOpen}>
                Create Order
              </Button>
            </Box>
  
            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
              {STATUS_TABS.map((status) => (
                <Tab key={status} label={status} value={status} />
              ))}
            </Tabs>
            <TableContainer>
              <Table>
                <TableRow>
                  <TableCell align="center">
                    <Typography variant="h6">Order ID</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6">Event Name</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6">Attendee</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6">Discount Code</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6">Order Date</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6">Status</Typography>
                  </TableCell>
                </TableRow>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow
                        key={order.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="center">{order.id}</TableCell>
                        <TableCell align="center">{order.eventName}</TableCell>
                        <TableCell align="center">{order.attendeeName}</TableCell>
                        <TableCell align="center">{order.discountCode}</TableCell>
                        <TableCell align="center">{order.orderDate}</TableCell>
                        <TableCell align="center">{order.status}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePaginationCustom
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
  
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Create Order</DialogTitle>
          <DialogContent>
            <TextField
              label="Event Name"
              name="eventName"
              fullWidth
              margin="dense"
              onChange={handleChange}
            />
            <TextField
              label="Attendee Name"
              name="attendeeName"
              fullWidth
              margin="dense"
              onChange={handleChange}
            />
            <TextField
              label="Discount Code"
              name="discountCode"
              fullWidth
              margin="dense"
              onChange={handleChange}
            />
            <TextField
              label="Order Date"
              name="orderDate"
              fullWidth
              margin="dense"
              type="date"
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleCreateOrder} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }