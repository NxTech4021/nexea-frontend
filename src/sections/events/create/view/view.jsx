import { useState, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { _jobs } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EventLists from '../event-lists';
import EventCreateDialog from '../dialog/event-create-dialog';

// ----------------------------------------------------------------------

export default function Events() {
  const settings = useSettingsContext();

  const smUp = useResponsive('down', 'sm');

  const [search, setSearch] = useState('');

  const createDialog = useBoolean();

  const handleSearch = useCallback(
    (inputValue) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = _jobs.filter(
          (job) => job.title.toLowerCase().indexOf(search.query.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [search.query]
  );

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Events"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Event',
            link: paths.dashboard.events,
          },
          { name: 'List' },
        ]}
        sx={{
          mb: 5,
        }}
      />

      <EventLists query={search} />

      <EventCreateDialog open={createDialog.value} onClose={createDialog.onFalse} />
    </Container>
  );
}
