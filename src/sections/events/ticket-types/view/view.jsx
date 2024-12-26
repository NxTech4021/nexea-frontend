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
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { _EventNames } from 'src/_mock/_event';
import { _TicketTypes, TICKET_STATUS_OPTIONS } from 'src/_mock/_ticketTypes';

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
  eventName: yup.string().required('Event Name is required'),
  type: yup.string().required('Type is required'),
  category: yup.string().required('Category is required'),
  price: yup.number().required('Price is required').positive('Price must be a positive number'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be a positive number'),
});

const RenderSelectField = ({ name, control, label, options, required, placeholder }) => (
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
            renderValue={(selected) => selected || 'Select an option'}
          >
            <MenuItem disabled value="">
              <em>Select an option</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.id || option} value={option.name || option}>
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

export default function TicketTypeView({ data }) {
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(_TicketTypes);
  const [filters, setFilters] = useState(defaultFilters);
  const [openDialog, setOpenDialog] = useState(false);

  const eventNameOptions = [...new Set(tableData.map((ticket) => ticket.eventName))];

  const ticketTypes = ['Early Bird', 'Standard'];
  const ticketCategories = ['Startup', 'General', 'Speaker', 'VIP'];

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
      eventName: '',
      type: '',
      category: '',
      price: '',
      quantity: '',
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = handleSubmit(async (item) => {
    try {
      const newTicketType = {
        eventName: item.eventName,
        type: item.type,
        category: item.category,
        price: parseFloat(item.price),
        status: 'inactive',
      };

      setTableData((prevData) => [...prevData, newTicketType]);
      setOpenDialog(false);
      enqueueSnackbar('Ticket type created successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to create ticket type', { variant: 'error' });
    }
  });

  useEffect(() => {
    if (data) {
      setTableData((prevData) => [...prevData, data]);
    }
  }, [data]);

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        // await axiosInstance.delete(`${endpoints.admin.delete}/${id}`);
        const deleteRows = tableData.filter((row) => row.id !== id);
        setTableData(deleteRows);
        // enqueueSnackbar('Successfully deleted ticket type', { variant: 'success' });
      } catch (error) {
        // enqueueSnackbar(error?.message || 'Failed to delete ticket type', { variant: 'error' });
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

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, md: 5 },
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

        {tableData?.length && (
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
                        ((tab.value === 'all' || tab.value === filters.status) && 'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'active' && 'success') ||
                        (tab.value === 'inactive' && 'error') ||
                        'default'
                      }
                    >
                      {['active', 'inactive'].includes(tab.value)
                        ? tableData.filter((item) => item.status === tab.value).length
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
        )}
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
              <RenderSelectField
                name="eventName"
                control={control}
                label="Event Name"
                options={_EventNames}
                required
              />

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
  console.log(inputData);

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
    inputData = inputData.filter((id) => id.status === status);
  }

  if (eventName.length) {
    inputData = inputData.filter((id) => eventName.includes(id.eventName));
  }

  return inputData;
}
