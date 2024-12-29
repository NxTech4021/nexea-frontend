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
        // sx={{
        //   pb: 2,
        //   height: 1,
        //   position: 'fixed',
        //   width: NAV.W_MINI,
        //   borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
        //   ...hideScroll.x,
        // }}
        sx={{
          // height: 1,
          // zIndex: 10000,
          zIndex: 2,
          position: 'fixed',
          left: 10,
          width: NAV.W_MINI,
          // borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          border: 1,
          borderRadius: 2,
          borderColor: (theme) => theme.palette.divider,
          height: '95vh',
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'black' : 'whitesmoke'),
          ...hideScroll.x,
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2 }} />

        <NavSectionMini
          data={navData}
          slotProps={{
            currentRole: user?.role,
          }}
        />
      </Stack>
    </Box>
  );
}
