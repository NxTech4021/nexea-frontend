import { m } from 'framer-motion';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { useAuthContext } from 'src/auth/hooks';
import { MaterialUISwitch } from 'src/theme/overrides/components/switch';

import Iconify from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { useSettingsContext } from 'src/components/settings';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Home',
    linkTo: '/',
  },
  {
    label: 'Profile',
    linkTo: paths.dashboard.user.profile,
  },
  // {
  //   label: 'Settings',
  //   linkTo: '/#2',
  // },
];

// ----------------------------------------------------------------------

export default function AccountPopover({ 
  open: externalOpen, 
  onClose: externalOnClose, 
  anchorOrigin,
  transformOrigin,
  ...other 
}) {
  const router = useRouter();

  const { user } = useAuthContext();

  const { logout } = useAuthContext();

  const settings = useSettingsContext();
  const lgUp = useResponsive('up', 'lg');

  const internalPopover = usePopover();

  // Use external popover state if provided, otherwise use internal
  const popover = {
    open: externalOpen !== undefined ? externalOpen : internalPopover.open,
    onOpen: internalPopover.onOpen,
    onClose: externalOnClose || internalPopover.onClose,
  };

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickItem = (path) => {
    popover.onClose();
    router.push(path);
  };

  // Determine popover positioning based on screen size and sidebar state
  const getPopoverOrigins = () => {
    // If external origins are provided, use them (for backwards compatibility)
    if (anchorOrigin && transformOrigin) {
      return { anchorOrigin, transformOrigin };
    }

    // For mobile (below lg), use dropdown positioning
    if (!lgUp) {
      return {
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        transformOrigin: { vertical: 'top', horizontal: 'right' },
      };
    }

    // For desktop with expanded sidebar, open to the right
    if (settings.themeLayout === 'vertical') {
      return {
        anchorOrigin: { vertical: 'center', horizontal: 'right' },
        transformOrigin: { vertical: 'center', horizontal: 'left' },
      };
    }

    // For desktop with mini sidebar, use dropdown positioning
    return {
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      transformOrigin: { vertical: 'top', horizontal: 'right' },
    };
  };

  const { anchorOrigin: finalAnchorOrigin, transformOrigin: finalTransformOrigin } = getPopoverOrigins();

  // If external popover control is provided, don't render the trigger button
  if (externalOpen !== undefined) {
    return (
      <CustomPopover 
        open={popover.open} 
        onClose={popover.onClose} 
        anchorOrigin={finalAnchorOrigin}
        transformOrigin={finalTransformOrigin}
        sx={{ width: 200, p: 0 }}
        {...other}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.fullName || 'User Name'}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Theme Toggle */}
        <MenuItem sx={{ m: 1, justifyContent: 'space-between' }}>
          <Typography variant="body2">Dark Mode</Typography>
          <MaterialUISwitch
            sx={{ m: 0, transform: 'scale(0.8)' }}
            checked={settings.themeMode !== 'light'}
            onChange={() =>
              settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')
            }
          />
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    );
  }

  // Default behavior with internal popover and trigger button
  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 24,
          height: 24,
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Iconify icon="solar:menu-dots-linear" width={16} />
      </IconButton>

      <CustomPopover 
        open={popover.open} 
        onClose={popover.onClose} 
        anchorOrigin={finalAnchorOrigin}
        transformOrigin={finalTransformOrigin}
        sx={{ width: 200, p: 0 }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.fullName || 'User Name'}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Theme Toggle */}
        {/* <MenuItem sx={{ m: 1, justifyContent: 'space-between' }}>
          <Typography variant="body2">Dark Mode</Typography>
          <MaterialUISwitch
            sx={{ m: 0, transform: 'scale(0.8)' }}
            checked={settings.themeMode !== 'light'}
            onChange={() =>
              settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')
            }
          />
        </MenuItem> */}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}

AccountPopover.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  anchorOrigin: PropTypes.object,
  transformOrigin: PropTypes.object,
};
