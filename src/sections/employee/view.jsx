import Container from '@mui/material/Container';
import { Card, Stack, Select, MenuItem, IconButton, InputLabel, FormControl } from '@mui/material';

import { paths } from 'src/routes/paths';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import EmployeeLists from './employee-list';
import EmployeeSearch from './employee-search';

// ----------------------------------------------------------------------

export default function Employees() {
  const settings = useSettingsContext();

  const header = (
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
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel id="role">Role</InputLabel>
        <Select labelId="role" id="demo-simple-select" label="Role">
          <MenuItem value={10}>Admin</MenuItem>
          <MenuItem value={20}>Intern</MenuItem>
          <MenuItem value={30}>Fulltimer</MenuItem>
        </Select>
      </FormControl>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <EmployeeSearch />
        <IconButton>
          <Iconify icon="pepicons-pencil:dots-y" />
        </IconButton>
      </Stack>
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Employees"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Employee',
            href: paths.dashboard.employee,
          },
          { name: 'List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <Stack>
          {header}
          <EmployeeLists />
        </Stack>
      </Card>
    </Container>
  );
}
