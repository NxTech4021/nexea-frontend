import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

export default function TicketTableToolbar({
  filters,
  onFilters,
  eventNameOptions = [],
}) {

  const handleFilterTitle = useCallback(
    (event) => {
      onFilters('title', event.target.value);
    },
    [onFilters]
  );

  const handleFilterEventName = useCallback(
    (event) => {
      onFilters(
        'eventName',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onFilters('status', event.target.value);
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
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Event Name</InputLabel>
          <Select
            multiple
            value={filters.eventName}
            onChange={handleFilterEventName}
            input={<OutlinedInput label="Event Name" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {eventNameOptions.length &&
              eventNameOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox disableRipple size="small" checked={filters.eventName.includes(option)} />
                  {option}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.title}
            onChange={handleFilterTitle}
            placeholder="Search by Title..."
          />

        </Stack>
      </Stack>
  );
}

TicketTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  eventNameOptions: PropTypes.array,
};