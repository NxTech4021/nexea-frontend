import useSWR from 'swr';
import dayjs from 'dayjs';
import React, { useState } from 'react';

import {
  Box,
  Grid,
  Stack,
  Button,
  Select,
  Dialog,
  Avatar,
  Divider,
  MenuItem,
  Container,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { fetcher, endpoints } from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { TablePaginationCustom } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

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
const STATUS_TABS = ['All', 'paid', 'pending', 'failed'];
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

  const { data, isLoading } = useSWR(endpoints.order.root, fetcher);

  const filteredOrders =
    !!data?.length &&
    data.filter(
      (order) =>
        (tab === 'All' || order.status === tab.toLowerCase()) &&
        (eventFilter === 'All' || order.event.name === eventFilter) &&
        (order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.event.name.toLowerCase().includes(search.toLowerCase()) ||
          order.attendee.name.toLowerCase().includes(search.toLowerCase()) ||
          order.discountCode.code.toLowerCase().includes(search.toLowerCase()) ||
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

        {/* Search and Actions Section */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  mb: 2,
                  width: '100%',
                }}
              >
                <TextField
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Orders"
                  InputProps={{
                    startAdornment: (
                      <Iconify
                        icon="eva:search-fill"
                        sx={{
                          color: 'text.disabled',
                          width: 20,
                          height: 20,
                          mr: 1,
                        }}
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 40,
                    },
                  }}
                />

                <Select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  sx={{
                    minWidth: 200,
                    height: 40,
                  }}
                >
                  {EVENT_OPTIONS.map((event) => (
                    <MenuItem key={event} value={event}>
                      {event}
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  variant="contained"
                  color="info"
                  onClick={handleClickOpen}
                  sx={{
                    minWidth: 'fit-content',
                    height: 40,
                    fontWeight: 550,
                  }}
                >
                  Create Order
                </Button>
              </Stack>

              {/* Status Filter Buttons - Similar to event-lists.jsx */}
              <Stack
                direction="row"
                sx={{
                  width: 'fit-content',
                  position: 'relative',
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  '& .MuiButton-root': {
                    fontSize: '0.875rem',
                    fontWeight: 450,
                  },
                }}
              >
                {STATUS_TABS.map((status, index) => {
                  const isActive = tab === status;
                  let statusConfig = { color: 'text.primary', bgColor: 'transparent' };

                  if (status === 'paid') {
                    statusConfig = {
                      icon: 'eva:checkmark-circle-2-fill',
                      color: '#229A16',
                      bgColor: '#E9FCD4',
                    };
                  } else if (status === 'pending') {
                    statusConfig = {
                      icon: 'eva:clock-fill',
                      color: '#B78103',
                      bgColor: '#FFF7CD',
                    };
                  } else if (status === 'failed') {
                    statusConfig = {
                      icon: 'ic:outline-block',
                      color: '#B72136',
                      bgColor: '#FFE7D9',
                    };
                  }

                  let buttonColor = 'text.secondary';
                  let buttonBgColor = 'transparent';

                  if (isActive) {
                    if (status === 'All') {
                      buttonColor = 'text.primary';
                      buttonBgColor = (theme) =>
                        theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)';
                    } else {
                      buttonColor = statusConfig.color;
                      buttonBgColor = statusConfig.bgColor;
                    }
                  }

                  let hoverBgColor = 'action.hover';

                  if (isActive) {
                    if (status === 'All') {
                      hoverBgColor = (theme) =>
                        theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)';
                    } else {
                      hoverBgColor = statusConfig.bgColor;
                    }
                  }

                  return (
                    <Button
                      key={status}
                      disableRipple
                      onClick={(e) => setTab(status)}
                      startIcon={
                        status !== 'All' ? (
                          <Iconify icon={statusConfig.icon} sx={{ width: 18, height: 18 }} />
                        ) : null
                      }
                      sx={{
                        minWidth: 'max-content',
                        height: '32px',
                        px: 1.5,
                        color: buttonColor,
                        bgcolor: buttonBgColor,
                        borderRight: index !== STATUS_TABS.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: hoverBgColor,
                        },
                      }}
                    >
                      {status[0].toUpperCase() + status.slice(1)}
                    </Button>
                  );
                })}
              </Stack>
            </Grid>

            {/* Table Section - Separate from search/filter controls */}
            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: { xs: 'auto', sm: 'hidden' },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? '#f1f2f3' : 'background.neutral',
                    minWidth: { xs: 800, sm: '100%' },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      width: '100%',
                      '& > *:not(:last-child)': {
                        borderRight: (theme) =>
                          `1px solid ${theme.palette.mode === 'light' ? '#dedfe2' : 'rgba(255, 255, 255, 0.12)'}`,
                        pr: 2,
                        mr: 2,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Order ID
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '20%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Event Name
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '20%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Buyer Name
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Discount Code
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Order Date
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: '15%',
                        color: (theme) =>
                          theme.palette.mode === 'light' ? '#151517' : 'common.white',
                        fontWeight: 550,
                      }}
                    >
                      Status
                    </Typography>
                  </Stack>
                </Stack>
                <Stack
                  sx={{
                    maxHeight: '70vh',
                    overflow: 'auto',
                    minWidth: { xs: 800, sm: '100%' },
                  }}
                >
                  {(filteredOrders || [])
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => {
                      let statusConfig = {};

                      if (order.status === 'paid') {
                        statusConfig = {
                          color: '#229A16',
                          bgColor: '#E9FCD4',
                          icon: 'eva:checkmark-circle-2-fill',
                        };
                      } else if (order.status === 'pending') {
                        statusConfig = {
                          color: '#B78103',
                          bgColor: '#FFF7CD',
                          icon: 'eva:clock-fill',
                        };
                      } else {
                        statusConfig = {
                          color: '#B72136',
                          bgColor: '#FFE7D9',
                          icon: 'ic:outline-block',
                        };
                      }

                      return (
                        <Stack
                          key={order.id}
                          direction="row"
                          alignItems="center"
                          sx={{
                            px: 3,
                            py: 1.5,
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'background.neutral',
                            },
                          }}
                          spacing={1}
                        >
                          <Label sx={{ width: '15%' }}>
                            {/* <Typography variant="body2" sx={{ width: '15%' }}> */}
                            {order.orderNumber}
                            {/* </Typography> */}
                          </Label>

                          <Typography variant="body2" sx={{ width: '20%' }}>
                            {order.event.name}
                          </Typography>

                          <Typography variant="body2" sx={{ width: '20%' }}>
                            {order.buyerName}
                          </Typography>

                          <Typography variant="body2" sx={{ width: '15%' }}>
                            {order?.discountCode?.code || 'N/A'}
                          </Typography>

                          <Typography variant="body2" sx={{ width: '15%' }}>
                            {dayjs(order.createdAt).format('LL')}
                          </Typography>

                          <Box sx={{ width: '15%' }}>
                            <Box
                              sx={{
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                width: 'fit-content',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: statusConfig.bgColor,
                              }}
                            >
                              <Iconify
                                icon={statusConfig.icon}
                                sx={{
                                  width: 16,
                                  height: 16,
                                  color: statusConfig.color,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: statusConfig.color,
                                  fontWeight: 600,
                                }}
                              >
                                {order.status}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      );
                    })}
                </Stack>
              </Box>

              {!filteredOrders && (
                <EmptyContent
                  filled
                  title="No Orders"
                  sx={{
                    py: 10,
                  }}
                />
              )}
              {/* <TableNoData notFound={!filteredOrders} sx={{ width: 1 }} /> */}

              <TablePaginationCustom
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(to bottom, #ffffff, #f9fafc)'
                : 'linear-gradient(to bottom, #1a202c, #2d3748)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 3,
            px: 4,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(245, 247, 250, 0.85)'
                : 'rgba(26, 32, 44, 0.85)',
          }}
        >
          <Avatar
            alt="Order"
            src="/logo/nexea.png"
            sx={{
              width: 58,
              height: 58,
              marginRight: 2.5,
              border: (theme) => `3px solid ${theme.palette.background.paper}`,
              backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f0f4f8' : '#2d3748'),
            }}
          />
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                color: (theme) => theme.palette.text.primary,
                letterSpacing: '-0.3px',
                mb: 0.5,
              }}
            >
              Create Order
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.85rem',
              }}
            >
              Create a new order for an event
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            p: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2.5}>
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
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(247, 250, 252, 0.5)' : 'rgba(26, 32, 44, 0.5)',
            borderTop: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'light' ? '#edf2f7' : '#2d3748'),
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: 4,
              height: '46px',
              padding: '0 24px',
              fontWeight: 600,
              borderColor: (theme) => (theme.palette.mode === 'light' ? '#e2e8f0' : '#4a5568'),
              color: (theme) => (theme.palette.mode === 'light' ? '#64748b' : '#a0aec0'),
              borderWidth: '1.5px',
              letterSpacing: '0.3px',
              textTransform: 'none',
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(74, 85, 104, 0.2)',
                borderColor: (theme) => (theme.palette.mode === 'light' ? '#cbd5e1' : '#718096'),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            sx={{
              borderRadius: 4,
              height: '46px',
              padding: '0 28px',
              fontWeight: 600,
              backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#38bdf8' : '#3182ce'),
              color: 'white',
              textTransform: 'none',
              fontSize: '0.95rem',
              letterSpacing: '0.3px',
              boxShadow: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? '#0ea5e9' : '#2b6cb0',
                boxShadow: 'none',
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
