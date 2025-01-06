import  isEqual from 'lodash/isEqual';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

import { 
    Box, 
    Card, 
    Button, 
    Table, 
    Container, 
    TableBody, 
    Typography, 
    TableContainer, 
    Tabs, 
    Tab, 
    Tooltip,
    IconButton,
    alpha
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';

import {
    useTable,
    emptyRows,
    TableNoData,
    TableEmptyRows,
    TableHeadCustom,
    TablePaginationCustom,
    getComparator,
    TableSelectedAction,
} from 'src/components/table';

import mockDiscountCodes from 'src/_mock/_discountCodes';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import CreateDiscountCode from '../create-discount-codes';
import DiscountCodeTableRow from '../discount-codes-table-row';
import DiscountCodeTableToolbar from '../discount-codes-table-toolbar';
import DiscountCodeTableFiltersResult from '../discount-codes-table-filters-result';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

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
    // const { enqueueSnackbar } = useSnackbar();
    const [tableData, setTableData] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingDiscountCode, setEditingDiscountCode] = useState(null); 
    const [filters, setFilters] = useState(defaultFilters);
    const confirm = useBoolean();

    useEffect(() => {
        setTableData(mockDiscountCodes);
    }, []);

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters,
    });

    const dataInPage = dataFiltered?.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
    );

    const denseHeight = table.dense ? 56 : 76;
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

    const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    // enqueueSnackbar('Delete success!');
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered, dataInPage, table, tableData]);

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
        <>
            <Container maxWidth={false}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 5 } }}>
                <CustomBreadcrumbs
                    heading={<Typography variant="h4">Discount Code List</Typography>}
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
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

                        <DiscountCodeTableToolbar
                            filters={filters}
                            onFilters={handleFilters}
                        />

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
                                            .map((row) => (
                                                <DiscountCodeTableRow
                                                    key={row.id}
                                                    row={row}
                                                    selected={table.selected.includes(row.id)}
                                                    onSelectRow={() => table.onSelectRow(row.id)}
                                                    onDeleteRow={() => handleDeleteRow(row.id)}
                                                    onSave={handleSave}
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
  const { codeName, status} = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

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

