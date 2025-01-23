import { useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Typography } from '@mui/material';

import { usePathname } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';
import { useMockedUser } from 'src/hooks/use-mocked-user';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { NavSectionVertical } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

export default function NavVertical({ openNav, onCloseNav }) {
  const { user } = useMockedUser();

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const settings = useSettingsContext();

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.21} sx={{ ml: 3, mt: 3, mb: 4 }}>
        <Logo />
        <Typography level="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Nexea Event App
        </Typography>
      </Stack>

      <NavSectionVertical
        data={navData}
        slotProps={{
          currentRole: user?.role,
        }}
      />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      {/* <NavToggleButton /> */}
      {lgUp ? (
        <Stack
          sx={{
            // height: 1,
            zIndex: 2,
            position: 'fixed',
            left: 10,
            width: NAV.W_VERTICAL,
            // borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
            border: 1,
            borderRadius: 2,
            borderColor: (theme) => theme.palette.divider,
            height: '95vh',
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1A1A1A' : 'whitesmoke'),
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: -23,
              top: 6,
              zIndex: 9999,
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
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

NavVertical.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};
