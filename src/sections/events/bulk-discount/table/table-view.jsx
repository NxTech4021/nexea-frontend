import { toast } from 'sonner';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';

import {
  Box,
  Card,
  Table,
  useTheme,
  TableBody,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { endpoints, axiosInstance } from 'src/utils/axios';

import { useTable, TableNoData, getComparator, TableHeadCustom } from 'src/components/table';

import TableToolBar from './table-toolbar';
import TableRowItem from './table-row-item';
import TickerFilterResult from './ticket-filter-result';

const defaultFilters = {
  title: '',
  eventName: [],
  status: 'all',
};

const TABLE_HEAD = [
  { id: 'event', label: 'Event', width: 180 },
  { id: 'tickets', label: 'Tickets', width: 220 },
  { id: 'minQuantity', label: 'Minimum Quantity', width: 180 },
  { id: 'discount', label: 'Discount', width: 180 },
  { id: 'discount', label: 'Active', width: 180 },
  // { id: '', width: 88 },
];

const TableView = ({ data, isLoading }) => {
  const theme = useTheme();

  const table = useTable();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: data || [],
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

  const onChangeStatus = async (id, status) => {
    try {
      await axiosInstance.patch(endpoints.bulkDiscount.status.update, { id, status });
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    }
  };

  if (isLoading) {
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
            color: theme.palette.common.black,
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );
  }

  return (
    <Card sx={{ borderRadius: 1 }}>
      <TableToolBar
        filters={filters}
        onFilters={handleFilters}
        // eventNameOptions={eventNameOptions}
      />

      {canReset && (
        <TickerFilterResult
          filters={filters}
          onFilters={handleFilters}
          onResetFilters={handleResetFilters}
          results={dataFiltered.length}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <TableContainer>
        <Table>
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            headLabel={TABLE_HEAD}
            rowCount={dataFiltered.length}
            numSelected={table.selected.length}
            onSort={table.onSort}

            // onSelectAllRows={(checked) =>
            //   table.onSelectAllRows(
            //     checked,
            //     dataFiltered.map((row) => row.id)
            //   )
            // }
          />
          <TableBody>
            {!!dataFiltered.length &&
              dataFiltered.map((row) => <TableRowItem row={row} onChangeStatus={onChangeStatus} />)}

            <TableNoData
              notFound={notFound}
              sx={{ borderRadius: 1 }}
              title="No Bulk Discount Found"
            />

            {/* <TableEmptyRows
              height={denseHeight}
              emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
            /> */}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TableView;

TableView.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
};

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
