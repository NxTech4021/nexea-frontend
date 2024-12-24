import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Tab, 
  Tabs, 
  Card, 
  Table, 
  Tooltip, 
  Container, 
  TableBody, 
  IconButton, 
  TableContainer, 
  Box, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  OutlinedInput, 
  Select, 
  TextField,
  alpha,
  Typography,
  FormHelperText
} from '@mui/material';

import { Toaster } from 'react-hot-toast';
import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';

import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';

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

import { _EventNames } from 'src/_mock/_event';
import { TICKET_STATUS_OPTIONS, _TicketTypes } from 'src/_mock/_ticketTypes.js';
import FormProvider from 'src/components/hook-form/form-provider';

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
});

const RenderSelectField = ({ name, control, label, options, required }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <FormControl fullWidth error={!!fieldState.error}>
        <InputLabel>{label}</InputLabel>
        <Select
          {...field}
          input={<OutlinedInput label={label} required={required} />}
          MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
        >
          {options.map(option => (
            <MenuItem key={option.id || option} value={option.name || option}>{option.name || option}</MenuItem>
          ))}
        </Select>
        {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
      </FormControl>
    )}
  />
);

export default function TicketTypeView({ data }) {

  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(_TicketTypes);
  const [filters, setFilters] = useState(defaultFilters);
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);

  const eventNameOptions = [...new Set(tableData.map(ticket => ticket.eventName))];

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
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const newTicketType = {
        eventName: data.eventName,
        type: data.type,
        category: data.category,
        price: parseFloat(data.price),
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
        enqueueSnackbar('Successfully deleted ticket type', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error?.message || 'Failed to delete ticket type', { variant: 'error' });
      }
    },
    [enqueueSnackbar, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    enqueueSnackbar('Delete success!');
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered, dataInPage, enqueueSnackbar, table, tableData]);

  const handleViewDetails = (ticket) => {
    console.log('Viewing details for:', ticket);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 5 } }}>
          <CustomBreadcrumbs
            heading="List Ticket Types"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Ticket Types' },
              { name: 'List' },
            ]}
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateTicketType}
          >
            Create Ticket Type
          </Button>
        </Box>
      
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          PaperProps={{ sx: { width: '-webkit-fill-available' } }}
        >
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle>
            <Typography variant="h4">Create Ticket Type</Typography>
          </DialogTitle>
          <DialogContent>
          <Container sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
              <RenderSelectField 
                name="eventName" 
                control={control} 
                label="Event Name" 
                options={_EventNames} 
                required={true} 
              />

              <RenderSelectField 
                name="type" 
                control={control} 
                label="Type" 
                options={ticketTypes} 
                required={true} 
              />

              <RenderSelectField 
                name="category" 
                control={control} 
                label="Category" 
                options={ticketCategories} 
                required={true} 
              />

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
            </Box>
          </Container>

          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={onSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
          </FormProvider>
        </Dialog>
      
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
                      {[
                        'active',
                        'inactive',
                      ].includes(tab.value)
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
    
      <Toaster />
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

