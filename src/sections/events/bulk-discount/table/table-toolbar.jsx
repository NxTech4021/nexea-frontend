import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Stack, TextField } from '@mui/material';

const TableToolBar = ({ filters, onFilters, eventNameOptions = [] }) => {
  const handleFilterTitle = useCallback(
    (event) => {
      onFilters('title', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1, p: 2 }}>
      <TextField
        fullWidth
        value={filters.title}
        onChange={handleFilterTitle}
        placeholder="Search by Title..."
      />
    </Stack>
  );
};

export default TableToolBar;

TableToolBar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  eventNameOptions: PropTypes.array,
};
