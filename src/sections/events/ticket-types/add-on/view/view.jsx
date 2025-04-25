import useSWR from 'swr';
import { isEqual } from 'lodash';
import React, { useState, useCallback } from 'react';

import {
  Box,
  Tab,
  Card,
  Tabs,
  alpha,
  Table,
  Button,
  Container,
  TableBody,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { fetcher, endpoints } from 'src/utils/axios';

import { TICKET_STATUS_OPTIONS } from 'src/_mock/_ticketTypes';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
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

import AddOnTableRow from '../addOn-table-row';
import CreateAddOnDialog from '../dialog/create';
import AddOnTableToolbar from '../addOn-table-toolbar';

const defaultFilters = {
  title: '',
  eventName: [],
  status: 'all',
};

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...TICKET_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Name', width: 180 },
  { id: 'price', label: 'Price', width: 220 },
  { id: 'quantity', label: 'Quantity', width: 180 },
  { id: 'description', label: 'Description', width: 180 },
  { id: 'createdAt', label: 'Created At', width: 180 },
  { id: '', width: 88 },
];

const AddOnView = () => {
  const table = useTable();
  const create = useBoolean();

  const [filters, setFilters] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
  });

  useSWR(endpoints.ticketType.addOn.root, fetcher, { onSuccess: setTableData });

  const denseHeight = table.dense ? 56 : 76;
  const canReset = !isEqual(defaultFilters, filters);

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

  const handleFilters = useCallback((name, value) => {
    table.onResetPage();
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, [table]);

  const handleResetFilters = useCallback(() => setFilters(defaultFilters), []);
  const handleFilterStatus = useCallback((e, newValue) => handleFilters('status', newValue), [handleFilters]);

  const handleEditRow = (row) => {
    setEditForm(row);
    setEditDialogOpen(true);
  };

  const handleEditChange = (field) => (e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleEditSubmit = () => {
    console.log('Saving changes:', editForm);
    setEditDialogOpen(false);
  };
  const handleCloseEdit = () => setEditDialogOpen(false);

  const handleDeleteRow = useCallback((id) => console.log(id), []);
  const handleDeleteRows = useCallback(() => console.log('Deleted'), []);

  return (
    <Container maxWidth="xl">
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'left', sm: 'center' }} mb={{ xs: 3, md: 5 }} gap={1}>
        <CustomBreadcrumbs
          heading="Add Ons"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Ticket Types', href: paths.dashboard.ticketType.root },
            { name: 'Add On' },
            { name: 'List' },
          ]}
        />
        <Button variant="contained" onClick={create.onTrue} startIcon={<Iconify icon="icon-park-solid:add-web" />}>
          Create New Add On
        </Button>
      </Box>

      <Card>
        <Tabs value={filters.status} onChange={handleFilterStatus} sx={{ px: 2.5, boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}` }}>
          {STATUS_OPTIONS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={<Label variant={tab.value === filters.status || tab.value === 'all' ? 'filled' : 'soft'} color={tab.value ? 'success' : 'default'}>
                {[true, false].includes(tab.value) ? tableData.filter((item) => item.isActive === tab.value).length : tableData.length}
              </Label>}
            />
          ))}
        </Tabs>

        <AddOnTableToolbar filters={filters} onFilters={handleFilters} />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={dataFiltered.length}
            onSelectAllRows={(checked) => table.onSelectAllRows(checked, dataFiltered.map((row) => row.id))}
            // action={
            //   <Tooltip title="Delete">
            //     <IconButton color="primary" onClick={confirm.onTrue}>
            //       <Iconify icon="solar:trash-bin-trash-bold" />
            //     </IconButton>
            //   </Tooltip>
            // }
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
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, dataFiltered.map((row) => row.id))}
              />
              <TableBody>
                {dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <AddOnTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row)}
                    />
                  ))}

                <TableEmptyRows height={denseHeight} emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)} />
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
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <CreateAddOnDialog onClose={create.onFalse} open={create.value} />

      <Dialog open={editDialogOpen} onClose={handleCloseEdit}>
        <DialogTitle>Edit Add-On</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" fullWidth value={editForm.name} onChange={handleEditChange('name')} />
          <TextField margin="dense" label="Price" fullWidth value={editForm.price} onChange={handleEditChange('price')} />
          <TextField margin="dense" label="Quantity" fullWidth value={editForm.quantity} onChange={handleEditChange('quantity')} />
          <TextField margin="dense" label="Description" fullWidth value={editForm.description} onChange={handleEditChange('description')} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddOnView;

function applyFilter({ inputData, comparator, filters }) {
  let { title, status } = filters;
  let filtered = [...inputData];

  if (title) {
    filtered = filtered.filter((item) => item?.title?.toLowerCase().includes(title.toLowerCase()));
  }

  if (status !== 'all') {
    filtered = filtered.filter((item) => item.status === status);
  }

  //   const { title, status, eventName } = filters;

  //   const stabilizedThis = inputData?.map((el, index) => [el, index]);

  //   stabilizedThis?.sort((a, b) => {
  //     const order = comparator(a[0], b[0]);
  //     if (order !== 0) return order;
  //     return a[1] - b[1];
  //   });

  //   inputData = stabilizedThis?.map((el) => el[0]);

  //   if (title) {
  //     inputData = inputData.filter(
  //       (id) => id?.title?.toLowerCase().indexOf(title.toLowerCase()) !== -1
  //     );
  //   }

  //   if (status !== 'all') {
  //     inputData = inputData.filter((ticket) => ticket.isActive === status);
  //   }

  //   if (eventName.length) {
  //     inputData = inputData.filter((ticker) => eventName.includes(ticker.event.name));
  //   }

  return inputData;
  return filtered.sort(comparator);
}