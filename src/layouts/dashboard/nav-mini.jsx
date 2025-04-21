import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { hideScroll } from 'src/theme/css';

import Logo from 'src/components/logo';
import { NavSectionMini } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import NavToggleButton from '../common/nav-toggle-button';

// ----------------------------------------------------------------------

export default function NavMini() {
  const { user } = useMockedUser();

  const navData = useNavData();

  return (
    <Box
      component="div"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 25,
          left: NAV.W_MINI - 3,
        }}
      />

      <Stack
        sx={{
          zIndex: 2,
          position: 'fixed',
          left: 10,
          width: NAV.W_MINI,
          border: 1,
          borderRadius: 2,
          borderColor: (theme) => theme.palette.divider,
          height: '95vh',
          top: '50%',
          transform: 'translateY(-50%)',

          ...hideScroll.x,
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2 }} />

        <NavSectionMini
          data={navData}
          slotProps={{
            currentRole: user?.role,
          }}
          sx={{ mx: 'auto' }}
        />
      </Stack>
    </Box>
  );
}
