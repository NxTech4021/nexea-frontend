/* eslint-disable react/prop-types */
import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import { enqueueSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Tab,
  Box,
  Tabs,
  Card,
  Table,
  alpha,
  Stack,
  Dialog,
  Button,
  Select,
  Switch,
  Tooltip,
  MenuItem,
  Container,
  TableBody,
  TextField,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  ListItemText,
  DialogContent,
  DialogActions,
  TableContainer,
  FormHelperText,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useGetAllEvents } from 'src/api/event';
import { TICKET_STATUS_OPTIONS } from 'src/_mock/_ticketTypes';
import { createTicketType, useGetAllTicketTypes } from 'src/api/ticket-type';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import FormProvider from 'src/components/hook-form/form-provider';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import TicketTableRow from '../ticket-table-row';
import TicketTableToolbar from '../ticket-table-toolbar';
import TicketTableFiltersResult from '../ticket-table-filters-result';

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...TICKET_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'Title', label: 'Title', width: 180 },
  { id: 'eventName', label: 'Event Name', width: 220 },
  { id: 'type', label: 'Type', width: 180 },
  { id: 'category', label: 'Category', width: 180 },
  { id: 'price', label: 'Price', width: 180 },
  { id: 'status', label: 'Status', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters = {
  title: '',
  eventName: [],
  status: 'all',
};

const schema = yup.object().shape({
  eventId: yup.string().required('Event is required'),
  type: yup.string().required('Type is required'),
  category: yup.string().required('Category is required'),
  price: yup.number().required('Price is required').positive('Price must be a positive number'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be a positive number'),
});

const RenderSelectField = ({ name, control, label, options, required }) => (
  <Stack width={1} spacing={1}>
    <InputLabel required={required}>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth error={!!fieldState.error}>
          <Select
            {...field}
            displayEmpty
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
            renderValue={(selected) =>
              options.find((item) => item.id === selected)?.name || selected || 'Select an option'
            }
          >
            <MenuItem disabled value="">
              <em>Select an option</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option?.id || option} value={option?.id || option}>
                {option.name || option}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  </Stack>
);

const ticketTypes = ['Early Bird', 'Standard'];
const ticketCategories = ['Startup', 'General', 'Speaker', 'VIP'];

export default function TicketTypeView({ data }) {
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const { data: ticketTypesData, isLoading, mutate } = useGetAllTicketTypes();

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [openDialog, setOpenDialog] = useState(false);
  const { data: eventsData, isLoading: eventsLoading } = useGetAllEvents();

  const eventNameOptions = [...new Set(tableData?.map((ticket) => ticket?.event?.name))];

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered?.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();

      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleCreateTicketType = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      eventId: '',
      type: '',
      category: '',
      price: '',
      quantity: '',
      validity: '',
      requirement: {
        minimumTicketPerOrder: '',
        maximumTicketPerOrder: '',
      },
      isActive: true,
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = handleSubmit(async (item) => {
    try {
      const newTicketType = {
        title: `${item.category} - ${item.type}`,
        type: item.type,
        eventId: item.eventId,
        category: item.category,
        validity: item.validity,
        price: parseFloat(item.price),
        quantity: item.quantity,
        minimumTicketPerOrder: parseInt(item.requirement.minimumTicketPerOrder, 10),
        maximumTicketPerOrder: parseInt(item.requirement.maximumTicketPerOrder, 10),
      };

      await createTicketType(newTicketType);
      mutate();
      // setTableData((prevData) => [...prevData, newTicketType]);
      setOpenDialog(false);
      enqueueSnackbar('Ticket type created successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to create ticket type', { variant: 'error' });
    }
  });

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await axiosInstance.delete(endpoints.ticketType.delete(id));
        const deleteRows = tableData.filter((row) => row.id !== id);
        setTableData(deleteRows);
        enqueueSnackbar('Successfully deleted ticket type', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error?.message || 'Failed to delete ticket type', { variant: 'error' });
      }
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    // enqueueSnackbar('Delete success!');
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered, dataInPage, table, tableData]);

  const handleViewDetails = (ticket) => {
    console.log('Viewing details for:', ticket);
  };

  useEffect(() => {
    if (ticketTypesData?.ticketTypes?.length) {
      setTableData(ticketTypesData?.ticketTypes);
    }
  }, [ticketTypesData]);

  if (eventsLoading || isLoading)
    return (
      <Box
        sx={{
          position: 'relative',
          top: 200,
          textAlign: 'center',
        }}
      >
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            color: (theme) => theme.palette.common.black,
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );

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
            heading="Ticket Types"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Ticket Types' },
              { name: 'List' },
            ]}
          />

          <Button
            variant="contained"
            onClick={handleCreateTicketType}
            startIcon={<Iconify icon="si:add-fill" />}
          >
            Create Ticket Type
          </Button>
        </Box>

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={(tab.value && 'success') || (!tab.value && 'error') || 'default'}
                  >
                    {[true, false].includes(tab.value)
                      ? tableData.filter((item) => item.isActive === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <TicketTableToolbar
            filters={filters}
            onFilters={handleFilters}
            eventNameOptions={eventNameOptions}
          />

          {canReset && (
            <TicketTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />
                <TableBody>
                  {dataFiltered
                    ?.slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <TicketTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onViewDetails={handleViewDetails}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: '-webkit-fill-available',
            borderRadius: 1,
            bgcolor: (theme) => theme.palette.background.default,
          },
        }}
      >
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle>
            <ListItemText
              primary="Create Ticket Type"
              secondary="Easily set up your ticket type now!"
              primaryTypographyProps={{ variant: 'h5' }}
            />
          </DialogTitle>

          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
              <Stack width={1} direction="row" spacing={1}>
                <RenderSelectField
                  name="eventId"
                  control={control}
                  label="Event Name"
                  options={eventsData.events.map((event) => ({ id: event.id, name: event.name }))}
                  required
                />
                <Stack spacing={1} width={1}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label={`Ticket is ${field.value ? 'Active' : 'Inactive'}`}
                      />
                    )}
                  />
                </Stack>
              </Stack>

              <RenderSelectField
                name="type"
                control={control}
                label="Type"
                options={ticketTypes}
                required
              />

              <RenderSelectField
                name="category"
                control={control}
                label="Category"
                options={ticketCategories}
                required
              />

              <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)' }}
                width={1}
                gap={1}
              >
                <Stack spacing={1} width={1}>
                  <InputLabel required>Price</InputLabel>

                  <Controller
                    name="price"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type="number"
                        placeholder="Price (RM)"
                        variant="outlined"
                        fullWidth
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error ? fieldState.error.message : ''}
                      />
                    )}
                  />
                </Stack>
                <Stack spacing={1} width={1}>
                  <InputLabel required>Quantity</InputLabel>

                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type="number"
                        placeholder="Quantity"
                        variant="outlined"
                        fullWidth
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error ? fieldState.error.message : ''}
                      />
                    )}
                  />
                </Stack>
                <Stack spacing={1} width={1}>
                  <InputLabel required={false}>Minimum tickets per order</InputLabel>

                  <Controller
                    name="requirement.minimumTicketPerOrder"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type="number"
                        placeholder="No minimum"
                        variant="outlined"
                        fullWidth
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error ? fieldState.error.message : ''}
                      />
                    )}
                  />
                </Stack>
                <Stack spacing={1} width={1}>
                  <InputLabel required={false}>Maximum tickets per order</InputLabel>

                  <Controller
                    name="requirement.maximumTicketPerOrder"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type="number"
                        placeholder="No maximum"
                        variant="outlined"
                        fullWidth
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error ? fieldState.error.message : ''}
                      />
                    )}
                  />
                </Stack>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleCloseDialog} sx={{ fontWeight: 400 }}>
              Cancel
            </Button>
            <LoadingButton onClick={onSubmit} variant="contained" sx={{ fontWeight: 400 }}>
              Submit
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { title, status, eventName } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  if (title) {
    inputData = inputData.filter(
      (id) => id?.title?.toLowerCase().indexOf(title.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((ticket) => ticket.isActive === status);
  }

  if (eventName.length) {
    inputData = inputData.filter((ticker) => eventName.includes(ticker.event.name));
  }

  return inputData;
}
