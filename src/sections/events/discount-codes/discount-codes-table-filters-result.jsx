import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function DiscountCodeTableFiltersResult({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}) {
  const handleRemoveKeyword = useCallback(() => {
    onFilters('codeName', '');
  }, [onFilters]);

  const handleRemoveStatus = useCallback(() => {
    onFilters('status', 'all');
  }, [onFilters]);

  const handleRemoveAvailability = useCallback(() => {
    onFilters('availability', 'all');
  }, [onFilters]);

  const handleRemoveType = useCallback(() => {
    onFilters('type', 'all');
  }, [onFilters]);

  const handleRemoveEvent = useCallback(() => {
    onFilters('event', 'all');
  }, [onFilters]);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.status !== 'all' && (
          <Block label="Status:">
            <Chip
              size="small"
              label={filters.status ? 'Active' : 'Expired'}
              onDelete={handleRemoveStatus}
            />
          </Block>
        )}

        {!!filters.codeName && (
          <Block label="Search:">
            <Chip label={filters.codeName} size="small" onDelete={handleRemoveKeyword} />
          </Block>
        )}

        {filters.event !== 'all' && (
          <Block label="Event:">
            <Chip
              size="small"
              label={filters.event}
              onDelete={handleRemoveEvent}
            />
          </Block>
        )}

        {filters.availability !== 'all' && (
          <Block label="Availability:">
            <Chip
              size="small"
              label={filters.availability}
              onDelete={handleRemoveAvailability}
            />
          </Block>
        )}

        {filters.type !== 'all' && (
          <Block label="Type:">
            <Chip
              size="small"
              label={filters.type}
              onDelete={handleRemoveType}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

DiscountCodeTableFiltersResult.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
};

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};
