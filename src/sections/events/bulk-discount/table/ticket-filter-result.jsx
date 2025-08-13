import React from 'react';
import PropTypes from 'prop-types';

import { Box, Chip, Paper, Stack, Button } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

const TickerFilterResult = ({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}) => {
  console.log('sds');
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
              label={filters.status ? 'Active' : 'Inactive'}
              // onDelete={handleRemoveStatus}
            />
          </Block>
        )}

        {!!filters.eventName.length && (
          <Block label="Event Name:">
            {filters.eventName.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                // onDelete={() => handleRemoveEventName(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.title && (
          <Block label="Keyword :">
            <Label sx={{ bgcolor: 'black', color: 'white', fontWeight: 400 }}>
              {filters.title}
            </Label>
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
};

export default TickerFilterResult;

TickerFilterResult.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
};

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
