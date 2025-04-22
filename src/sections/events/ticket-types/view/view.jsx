/* eslint-disable react/prop-types */
import dayjs from 'dayjs';
import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
// import { Color } from '@tiptap/extension-color';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect, useCallback } from 'react';

import {
  Tab,
  Box,
  Tabs,
  Card,
  Table,
  alpha,
  Button,
  Tooltip,
  Container,
  TableBody,
  IconButton,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints, axiosInstance } from 'src/utils/axios';

import { useGetAllEvents } from 'src/api/event';
import { TICKET_STATUS_OPTIONS } from 'src/_mock/_ticketTypes';
import { createTicketType, useGetAllTicketTypes } from 'src/api/ticket-type';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
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
import { useAddOnsStore } from '../hooks/use-add-on';
import CreateTicketTypeDialog from '../dialog/create';
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
  category: yup.string().when('type', {
    is: (val) => val !== 'After Party',
    then: (s) => yup.string().required('Category is required'),
    otherwise: (s) => yup.string().notRequired(),
  }),
  price: yup.string().required('Price is required'),
  title: yup.string().required('Ticket title is required'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be a positive number'),
});

export default function TicketTypeView({ data }) {
  const table = useTable();

  const confirm = useBoolean();

  const selectedAddOns = useAddOnsStore((state) => state.selectedAddOns);

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
      description: '',
      title: '',
      price: '',
      quantity: null,
      validity: '',
      requirement: {
        minimumTicketPerOrder: '',
        maximumTicketPerOrder: '',
      },
      isActive: true,
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (item) => {
    try {
      const newTicketType = {
        title: item.title,
        type: item.type,
        eventId: item.eventId,
        category: item.category,
        description: item.description,
        validity: item.validity,
        price: parseFloat(item.price),
        quantity: item.quantity,
        minimumTicketPerOrder: parseInt(item.requirement.minimumTicketPerOrder, 10),
        maximumTicketPerOrder: parseInt(item.requirement.maximumTicketPerOrder, 10),
        selectedAddOns: selectedAddOns?.length ? selectedAddOns : null,
      };

      await createTicketType(newTicketType);
      mutate();
      setOpenDialog(false);
      enqueueSnackbar('Ticket type created successfully!', { variant: 'success' });
    } catch (error) {
      console.log(error.message);
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
  const handleEditSuccess = (updatedTicket) => {
    // Update local state immediately
    setTableData((prev) =>
      prev.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
    );

    // Re-fresh data from server (if using SWR/mutate)
    if (mutate) mutate();
  };
  useEffect(() => {
    if (ticketTypesData?.ticketTypes?.length) {
      setTableData(
        ticketTypesData?.ticketTypes.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
      );
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
            startIcon={<Iconify icon="f7:tickets-fill" />}
          >
            Create New Ticket Type
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
                        onEditSuccess={handleEditSuccess}
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

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <CreateTicketTypeDialog
          eventsData={eventsData}
          onClose={handleCloseDialog}
          openDialog={openDialog}
          onSubmit={onSubmit}
        />
      </FormProvider>

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
