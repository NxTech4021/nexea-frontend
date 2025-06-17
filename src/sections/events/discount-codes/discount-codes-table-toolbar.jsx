import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

export default function DiscountCodeTableToolbar({
  filters,
  onFilters,
  availabilityOptions = [],
  typeOptions = [],
  eventOptions = [],
}) {

  const handleFilterName = useCallback(
    (event) => {
      onFilters('codeName', event.target.value);
    },
    [onFilters]
  );

  const handleFilterAvailability = useCallback(
    (event) => {
      onFilters('availability', event.target.value);
    },
    [onFilters]
  );

  const handleFilterType = useCallback(
    (event) => {
      onFilters('type', event.target.value);
    },
    [onFilters]
  );

  const handleFilterEvent = useCallback(
    (event) => {
      onFilters('event', event.target.value);
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
            placeholder="Search by discount code name..."
            sx={{ maxWidth: { sm: 280 } }}
          />
          
          <TextField
            fullWidth
            select
            label="Event"
            value={filters.event}
            onChange={handleFilterEvent}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 220,
                  },
                },
              },
            }}
            sx={{
              maxWidth: { sm: 200 },
              textTransform: 'capitalize',
            }}
          >
            <MenuItem
              value="all"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              All Events
            </MenuItem>
            {eventOptions.map((option) => (
              <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            fullWidth
            select
            label="Availability"
            value={filters.availability}
            onChange={handleFilterAvailability}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 220,
                  },
                },
              },
            }}
            sx={{
              maxWidth: { sm: 220 },
              textTransform: 'capitalize',
            }}
          >
            <MenuItem
              value="all"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              All Availabilities
            </MenuItem>
            {availabilityOptions.map((option) => (
              <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Type"
            value={filters.type}
            onChange={handleFilterType}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 220,
                  },
                },
              },
            }}
            sx={{
              maxWidth: { sm: 180 },
              textTransform: 'capitalize',
            }}
          >
            <MenuItem
              value="all"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              All Types
            </MenuItem>
            {typeOptions.map((option) => (
              <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>
  );
}

DiscountCodeTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  availabilityOptions: PropTypes.array,
  typeOptions: PropTypes.array,
  eventOptions: PropTypes.array,
};