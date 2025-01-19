import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function DiscountCodeTableToolbar({
  filters,
  onFilters,
}) {

  const handleFilterName = useCallback(
    (event) => {
      onFilters('codeName', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.codeName}
            onChange={handleFilterName}
            placeholder="Search by Name..."
          />
        </Stack>
      </Stack>
  );
}

DiscountCodeTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};