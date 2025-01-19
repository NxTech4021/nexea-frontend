import { useState, useCallback } from 'react';

import Container from '@mui/material/Container';
import { Card, Stack, Button, TextField, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { _jobs } from 'src/_mock';

import Iconify from 'src/components/iconify';
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
        heading="Event"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Event',
            link: paths.dashboard.events,
          },
          { name: 'List' },
        ]}
        sx={{
          mb: 3,
        }}
      />

      <Card
        sx={{
          p: 1.5,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <TextField
            name="search"
            label="Search"
            sx={{
              width: { xs: 'auto', md: 300 },
            }}
            onChange={(e) => setSearch(e.target.value)}
          />

          {smUp ? (
            <IconButton
              sx={{
                border: 1,
              }}
              component={RouterLink}
              href={paths.dashboard.events.create}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          ) : (
            <Button
              onClick={createDialog.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Event
            </Button>
          )}
        </Stack>
      </Card>

      {/* <EventSearch
        query={search.query}
        results={search.results}
        onSearch={handleSearch}
        hrefItem={(id) => paths.dashboard.job.details(id)}
      /> */}

      <EventLists query={search} />

      <EventCreateDialog open={createDialog.value} onClose={createDialog.onFalse} />
    </Container>
  );
}
