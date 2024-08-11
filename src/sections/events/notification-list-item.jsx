import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Box, Chip } from '@mui/material';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';

import Iconify from 'src/components/iconify';

const NotificationListItem = ({ attendees }) => {
  const apiRef = useGridApiRef();
  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState();

  const columns = [
    {
      field: 'fullName',
      headerName: 'Full name',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      flex: 1,
      width: 160,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
    {
      field: 'companyName',
      headerName: 'Company name',
      width: 150,
      flex: 1,
      editable: true,
    },
    {
      field: 'templateOne',
      headerName: 'Stage 1',
      width: 150,
      flex: 1,
      renderCell: (value, row) => (
        <Chip
          icon={<Iconify icon="ic:baseline-whatsapp" />}
          label={value.row.templateOne}
          size="small"
          color={value.row.templateOne === 'Pending' ? 'warning' : 'success'}
        />
      ),
    },
    {
      field: 'templateTwo',
      headerName: 'Stage 2',
      width: 150,
      flex: 1,
      renderCell: (value, row) => (
        <Chip
          icon={<Iconify icon="ic:baseline-whatsapp" />}
          label={value.row.templateTwo}
          size="small"
          color={value.row.templateTwo === 'Pending' ? 'warning' : 'success'}
        />
      ),
    },
    {
      field: 'templateThree',
      headerName: 'Stage 3',
      width: 150,
      flex: 1,
      renderCell: (value, row) => (
        <Chip
          icon={<Iconify icon="ic:baseline-whatsapp" />}
          label={value.row.templateThree}
          size="small"
          color={value.row.templateThree === 'Pending' ? 'warning' : 'success'}
        />
      ),
    },
  ];

  return (
    <Box>
      {attendees?.length && (
        <DataGrid
          rows={attendees}
          columns={columns}
          apiRef={apiRef}
          onPageChange={(newPage) => setPage(newPage)}
          autoHeight
          pagination
          pageSize={5}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      )}
    </Box>
  );
};

export default NotificationListItem;

NotificationListItem.propTypes = {
  attendees: PropTypes.array,
};
