import { useState, useCallback } from 'react';

import { Box, Container, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useSettingsContext } from 'src/components/settings';

import EventLists from '../event-lists';
import EventCountdown from '../event-countdown';
import EventCreateDialog from '../dialog/event-create-dialog';

// ----------------------------------------------------------------------

export default function Events() {
  const settings = useSettingsContext();
  const smUp = useResponsive('up', 'sm');
  const [search, setSearch] = useState('');
  const createDialog = useBoolean();

  const handleSearch = useCallback(
    (inputValue) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));
    },
    []
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={smUp ? "h4" : "h5"} 
          sx={{ 
            color: 'text.primary',
            mb: { xs: 1.5, sm: 2 }
          }}
        >
          Events
        </Typography>

        <EventCountdown />
      </Box>

      <EventLists query={search} />

      <EventCreateDialog open={createDialog.value} onClose={createDialog.onFalse} />
    </Container>
  );
}
