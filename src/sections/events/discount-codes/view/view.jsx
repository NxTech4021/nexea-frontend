import { useSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Table,
  Button,
  Container,
  TableBody,
  Typography,
  TableContainer,
} from '@mui/material';

import mockDiscountCodes from 'src/_mock/_discountCodes';

import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import CreateDiscountCode from '../create-discount-codes';
import DiscountCodeTableRow from '../discount-codes-table-row';

const TABLE_HEAD = [
  { id: 'Name', label: 'Name' },
  { id: 'Type', label: 'Type' },
  { id: 'Value', label: 'Value' },
  { id: 'availability', label: 'Availability' },
  { id: 'category', label: 'Category' },
  { id: 'limit', label: 'Limit' },
  { id: 'endDate', label: 'Expired Date' },
  { id: '' },
];

export default function DiscountCodeView() {
  const table = useTable();
  const { enqueueSnackbar } = useSnackbar();
  const [tableData, setTableData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDiscountCode, setEditingDiscountCode] = useState(null);
  const denseHeight = table.dense ? 56 : 76;

  useEffect(() => {
    setTableData(mockDiscountCodes);
  }, []);

  const notFound = tableData.length === 0;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const updatedData = tableData.filter((row) => row.id !== id);
        setTableData(updatedData);
        enqueueSnackbar('Successfully deleted Discount Code', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error?.message || 'Failed to delete Discount Code', { variant: 'error' });
      }
    },
    [enqueueSnackbar, tableData]
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
    [enqueueSnackbar, tableData]
  );

  const handleCreateClick = () => {
    setEditingDiscountCode(null);
    setIsCreating(true);
  };

  const handleSaveDiscountCode = (newData) => {
    if (editingDiscountCode) {
    } else {
      setTableData((prev) => [...prev, { ...newData, id: Date.now().toString() }]);
    }
    setIsCreating(false);
  };

  const handleCloseCreateForm = () => {
    setIsCreating(false);
  };

  return (
    <Container maxWidth={false}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 3, md: 5 },
        }}
      >
        <CustomBreadcrumbs
          heading={<Typography variant="h4">Discount Code List</Typography>}
          links={[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Discount Code' },
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
        />
      )}

      {tableData.length > 0 && (
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} onSort={table.onSort} align="center" />
                <TableBody>
                  {tableData
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <DiscountCodeTableRow
                        key={row.id}
                        row={row}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onSave={handleSave}
                      />
                    ))}
                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
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
  );
}
