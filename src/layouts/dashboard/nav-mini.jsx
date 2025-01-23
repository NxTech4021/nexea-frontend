import { useRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { hideScroll } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import { NavSectionMini } from 'src/components/nav-section';
import { useSettingsContext } from 'src/components/settings';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

export default function NavMini() {
  const { user } = useMockedUser();
  const boxRef = useRef(null);

  const navData = useNavData();
  const settings = useSettingsContext();

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      {/* <NavToggleButton
        sx={{
          top: 25,
          left: NAV.W_MINI - 3,
        }}
      /> */}

      {/* <Box
        sx={{
          position: 'fixed',
          left: 60,
          top: 25,
          zIndex: 99999,
        }}
      >
        <Iconify
          icon="ci:line-l"
          width={60}
          sx={{
            cursor: 'pointer',
            color: 'grey',
            '&:hover': {
              color: 'black',
              transition: 'all ease-in-out .2s',
            },
          }}
        />
      </Box> */}

      <Stack
        component="div"
        ref={boxRef}
        // component="div"
        // sx={{
        //   pb: 2,
        //   height: 1,
        //   position: 'fixed',
        //   width: NAV.W_MINI,
        //   borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
        //   ...hideScroll.x,
        // }}
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
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1A1A1A' : 'whitesmoke'),
          ...hideScroll.x,
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2 }} />

        <Box
          sx={{
            position: 'absolute',
            right: -23,
            top: 6,
          }}
          component="div"
          onClick={() =>
            settings.onUpdate(
              'themeLayout',
              settings.themeLayout === 'vertical' ? 'mini' : 'vertical'
            )
          }
        >
          <Iconify
            icon="ci:line-l"
            width={60}
            sx={{
              cursor: 'pointer',
              color: 'grey',
              '& :hover': {
                color: (theme) => (theme.palette.mode === 'light' ? 'black' : 'whitesmoke'),
                transition: 'all ease-in-out .2s',
              },
            }}
          />
        </Box>

        <NavSectionMini
          data={navData}
          slotProps={{
            currentRole: user?.role,
          }}
          sx={{
            mx: 'auto',
          }}
        />
      </Stack>
    </Box>
  );
}
