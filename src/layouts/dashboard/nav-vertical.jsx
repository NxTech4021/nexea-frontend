import { useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { useRouter, usePathname } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { useAuthContext } from 'src/auth/hooks';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { usePopover } from 'src/components/custom-popover';
import { useSettingsContext } from 'src/components/settings';
import { NavSectionVertical } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import AccountPopover from '../common/account-popover';

// ----------------------------------------------------------------------

export default function NavVertical({ openNav, onCloseNav, onOpenNav }) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const settings = useSettingsContext();

  const pathname = usePathname();
  const router = useRouter(); // Add router hook

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  const popover = usePopover();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

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
      <Box sx={{ px: 2.5, pt: 3, flex: 1 }}>
        <Box
          component="button"
          onClick={handleLogoClick}
          sx={{
            width: '100%',
            height: 40, 
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1,
            py: 0, 
            mb: 2, 
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <Logo sx={{ width: 20, height: 20 }} /> 
          <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '0.875rem' }}>
            Nexea Event App
          </Typography>
        </Box>

        <NavSectionVertical
          data={navData}
          slotProps={{
            currentRole: user?.role,
            gap: 1,
          }}
          sx={{
            '& .MuiListItemButton-root': {
              minHeight: 40,
              px: 1,
              py: 1,
              borderRadius: 1.5,
              mx: 0,
              mb: 0.5,
              justifyContent: 'flex-start',
              alignItems: 'center',
              textAlign: 'left',
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              fontWeight: 400,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
              '&.active': {
                backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[900] : theme.palette.primary.main,
                color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.primary.contrastText,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.primary.dark,
                },
              },
            },
            '& .MuiListItemIcon-root': {
              minWidth: 20,
              width: 20,
              height: 20,
              justifyContent: 'flex-start',
              alignItems: 'center',
              ml: 0,
              mr: 1,
              color: 'inherit',
            },
            '& .MuiListItemText-root': {
              margin: 0,
              '& .MuiTypography-root': {
                fontSize: '0.875rem',
                fontWeight: 'inherit',
                color: 'inherit',
                textAlign: 'left',
              },
            },
            '& .MuiCollapse-root': {
              '& .MuiListItemButton-root': {
                minHeight: 36,
                pl: 2,
                fontSize: '0.8125rem',
              },
            },
          }}
        />
      </Box>

      <Box sx={{ px: 2, py: 1.5, pb: 2 }}>
        <Box
          onClick={popover.onOpen}
          sx={{
            cursor: 'pointer',
            borderRadius: 1,
            p: 1, 
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={user?.photoURL}
              alt={user?.fullName}
              sx={{
                width: 32, 
                height: 32, 
                border: `solid 1px ${theme.palette.divider}`,
              }}
            >
              {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.palette.text.primary }}> 
                {user?.fullName || 'User Name'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }} noWrap> 
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{
                width: 20, 
                height: 20, 
                color: theme.palette.text.secondary,
                pointerEvents: 'none',
              }}
            >
              <Iconify icon="solar:menu-dots-linear" width={14} /> 
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Scrollbar>
  );

  return (
    <>
      {lgUp ? (
        <Stack
          sx={{
            width: NAV.W_VERTICAL,
            height: '100vh',
            backgroundColor: theme.palette.mode === 'light' ? '#F4F6F8' : theme.palette.background.paper,
            transition: 'width 0.3s ease-in-out',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              backgroundColor: theme.palette.mode === 'light' ? '#F4F6F8' : theme.palette.background.paper,
              height: '100vh',
              overflow: 'auto',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}

      <AccountPopover 
        open={popover.open} 
        onClose={popover.onClose}
      />
    </>
  );
}

NavVertical.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
  onOpenNav: PropTypes.func,
};
