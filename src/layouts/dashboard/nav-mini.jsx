import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { hideScroll } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks'

import Logo from 'src/components/logo';
import { usePopover } from 'src/components/custom-popover';
import { NavSectionMini } from 'src/components/nav-section';
import { useSettingsContext } from 'src/components/settings';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import AccountPopover from '../common/account-popover';

// ----------------------------------------------------------------------

export default function NavMini() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const router = useRouter();

  const navData = useNavData();
  const popover = usePopover();

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  return (
    <Stack
      sx={{
        width: NAV.W_MINI,
        height: '100vh',
        backgroundColor: theme.palette.mode === 'light' ? '#F4F6F8' : theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out',
        flexShrink: 0,
        overflow: 'hidden',
        ...hideScroll.x,
      }}
    >
        <Box sx={{ flex: 1, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            component="button"
            onClick={handleLogoClick}
            sx={{
              width: 40, 
              height: 40, 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              mb: 2, 
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Logo sx={{ width: 22, height: 22 }} /> 
          </Box>

          <NavSectionMini
            data={navData}
            slotProps={{
              currentRole: user?.role,
            }}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              '& .MuiListItemButton-root': {
                minHeight: 40,
                width: 40,
                borderRadius: 1.5,
                mb: 0.5,
                mx: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
                '&.active': {
                  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[900] : theme.palette.primary.main,
                  color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.primary.dark,
                  },
                },
              },
              '& .MuiListItemIcon-root': {
                minWidth: 'auto',
                width: 22,
                height: 22,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'inherit',
              },
              '& .MuiListItemText-root': {
                display: 'none',
              },
              '& .label': {
                display: 'none',
              },
            }}
          />
        </Box>

        <Box sx={{ p: 1, pb: 4, pl: 2, display: 'flex', justifyContent: 'center' }}> 
          <Avatar
            src={user?.photoURL}
            alt={user?.fullName}
            onClick={popover.onOpen}
            sx={{
              width: 28,
              height: 28,
              border: `solid 1px ${theme.palette.divider}`,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
          </Avatar>
        </Box>

        <AccountPopover 
          open={popover.open} 
          onClose={popover.onClose}
        />
      </Stack>
  );
}
