import { useState, useCallback } from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useMetaPixel } from 'src/hooks/use-track-page';

import EventLists from '../event-lists';
import EventCountdown from '../event-countdown';
import EventCreateDialog from '../dialog/event-create-dialog';

// ----------------------------------------------------------------------

export default function Events() {
  const [search, setSearch] = useState('');
  const createDialog = useBoolean();

  const handleSearch = useCallback((inputValue) => {
    setSearch((prevState) => ({
      ...prevState,
      query: inputValue,
    }));
  }, []);

  useMetaPixel('Test', {}, true, '598753975606755');

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <EventCountdown />
      </Box>

      <EventLists query={search} />

      <EventCreateDialog open={createDialog.value} onClose={createDialog.onFalse} />
    </>
  );
}
