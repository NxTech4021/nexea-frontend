import dayjs from 'dayjs';
import isEqual from 'lodash/isEqual';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Tab,
  Card,
  Tabs,
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

// import mockDiscountCodes from 'src/_mock/_discountCodes';
import { useGetAllTicketTypes } from 'src/api/ticket-type';
import { useGetAllDiscountCode, deleteDiscountCode} from 'src/api/discount-code';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
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

import DiscountCodeTableRow from '../discount-codes-table-row';
import CreateDiscountCode from '../modal/create-discount-codes';
import DiscountCodeTableToolbar from '../discount-codes-table-toolbar';
import DiscountCodeTableFiltersResult from '../discount-codes-table-filters-result';

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }];

const TABLE_HEAD = [
  { id: 'Name', label: 'Name', width: 180 },
  { id: 'Type', label: 'Type', width: 180 },
  { id: 'Value', label: 'Value', width: 180 },
  { id: 'availability', label: 'Availability', width: 220 },
  { id: 'limit', label: 'Limit', width: 180 },
  { id: 'endDate', label: 'Expired Date', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters = {
  codeName: '',
  status: 'all',
};

export default function DiscountCodeView() {
  const table = useTable();
  const [tableData, setTableData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDiscountCode, setEditingDiscountCode] = useState(null);
  const denseHeight = table.dense ? 56 : 76;
  const { data, isLoading } = useGetAllTicketTypes();
  const { discountCodes, discountCodesIsLoading, refetchDiscountCodes } = useGetAllDiscountCode();

  const [filters, setFilters] = useState(defaultFilters);
  const confirm = useBoolean();

  useEffect(() => {
    setTableData(discountCodes);
  }, [discountCodes]);

  const notFound = tableData?.length === 0;

  const dataFiltered = applyFilter({
    inputData: discountCodes,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered?.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !isEqual(defaultFilters, filters);
  // const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

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

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await deleteDiscountCode(id)
        await refetchDiscountCodes();
        const updatedData = tableData.filter((row) => row.id !== id);
        setTableData(updatedData);
        enqueueSnackbar('Successfully deleted Discount Code', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error?.message || 'Failed to delete Discount Code', { variant: 'error' });
      }
    },
    [tableData]
  );

  // const handleDeleteRows = useCallback(() => {
  //   const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
  //   // enqueueSnackbar('Delete success!');
  //   setTableData(deleteRows);

  //   table.onUpdatePageDeleteRows({
  //     totalRowsInPage: dataInPage.length,
  //     totalRowsFiltered: dataFiltered.length,
  //   });
  // }, [dataFiltered, dataInPage, table, tableData]);
  
  const handleDeleteRows = useCallback(
    async () => {
      try {
        await Promise.all(table.selected.map((id) => deleteDiscountCode(id)));
        await refetchDiscountCodes();
        const updatedData = tableData.filter((row) => !table.selected.includes(row.id));
        setTableData(updatedData);
        // table.onClearSelected();
        enqueueSnackbar('Successfully deleted selected Discount Codes', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error?.message || 'Failed to delete Discount Codes', { variant: 'error' });
      }
    },
    [table.selected, refetchDiscountCodes, tableData, table]
  );

  const handleSave = useCallback(
    async (editedData) => {
      try {
        const updatedData = tableData.map((row) =>
          row.id === editedData.id ? { ...row, ...editedData } : row
        );
        setTableData(updatedData);
        enqueueSnackbar('Successfully updated Discount Code', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error?.message || 'Failed to update Discount Code', { variant: 'error' });
      }
    },
    [tableData]
  );

  const handleCreateClick = () => {
    setEditingDiscountCode(null);
    setIsCreating(true);
  };

  const handleSaveDiscountCode = (newData) => {
    if (editingDiscountCode) {
      console.log('test');
    } else {
      setTableData((prev) => [...prev, { ...newData, id: Date.now().toString() }]);
    }
    setIsCreating(false);
  };

  const handleCloseCreateForm = () => {
    setIsCreating(false);
  };

  if (discountCodesIsLoading || isLoading) {
    return (
      <Box sx={{ position: 'absolute', top: '50%', left: '50%' }}>
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
            heading="Discount Codes"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Discount Codes' },
              { name: 'List' },
            ]}
          />
          <Button variant="contained" onClick={handleCreateClick}>
            Create Discount Code
          </Button>
        </Box>

        {isCreating && (
          <CreateDiscountCode
            discountCode={editingDiscountCode || {}}
            onCreate={handleSaveDiscountCode}
            open={isCreating}
            onClose={handleCloseCreateForm}
            ticketTypes={data?.ticketTypes}
          />
        )}

        {tableData?.length > 0 && (
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
                      color={(tab.value && 'default') || (!tab.value && 'error') || 'success'}
                    >
                      {[true, false].includes(tab.value)
                        ? tableData.filter((item) => item.isActive === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <DiscountCodeTableToolbar filters={filters} onFilters={handleFilters} />

            {canReset && (
              <DiscountCodeTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                onResetFilters={handleResetFilters}
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
                    headLabel={TABLE_HEAD}
                    align="center"
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={dataFiltered.length}
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
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      ?.map((row) => (
                        <DiscountCodeTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onSave={handleSave}
                          ticketTypes={data?.ticketTypes}
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
              page={table.page}
              rowsPerPage={table.rowsPerPage || 10}
              count={tableData.length}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
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
    </>
  );
}

// ------------------------------------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { codeName, status } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  stabilizedThis?.sort((a, b) =>
    dayjs(a?.createdAt).isBefore(dayjs(b?.createdAt), 'date') ? 1 : -1
  );

  inputData = stabilizedThis?.map((el) => el[0]);

  if (codeName) {
    inputData = inputData.filter(
      (id) => id?.codeName?.toLowerCase().indexOf(codeName.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((discountCode) => discountCode.isActive === status);
  }

  return inputData;
}
