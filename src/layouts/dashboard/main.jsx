import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

// import { NAV } from '../config-layout';

// ----------------------------------------------------------------------

const SPACING = 12;

export default function Main({ children, title, onOpenNav, sx, ...other }) {
  const theme = useTheme();
  const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const handleToggleNav = () => {
    settings.onUpdate('themeLayout', settings.themeLayout === 'vertical' ? 'mini' : 'vertical');
  };

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.neutral,
          p: lgUp ? `${SPACING}px` : 0,
          overflow: 'hidden',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: lgUp ? 2 : 0,
            border: lgUp ? `1px solid ${theme.palette.divider}` : 'none',
            backgroundColor: theme.palette.background.paper,
            overflow: 'hidden',
            boxShadow: lgUp ? theme.shadows[1] : 'none',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            ...sx,
          }}
          {...other}
        >
          {title && (
            <>
              <Stack direction="row" alignItems="center" sx={{ px: 2.5, py: 0.5, minHeight: 42 }}>
                {lgUp && (
                  <>
                    <IconButton
                      onClick={handleToggleNav}
                      sx={{
                        p: 0.5,
                        width: 40,
                        height: 40,
                        color: theme.palette.text.primary,
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Iconify 
                        icon="meteor-icons:sidebar" 
                        width={20}
                      />
                    </IconButton>
                    <Divider 
                      orientation="vertical" 
                      flexItem 
                      sx={{ 
                        mx: 2, 
                        height: 24,
                        alignSelf: 'center'
                      }} 
                    />
                  </>
                )}
                <Typography variant="subtitle1" component="h1" fontWeight={600} sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                  {title}
                </Typography>
              </Stack>
              <Divider />
            </>
          )}
          <Box sx={{ p: 2.5, flex: 1, overflow: 'auto', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            {children}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.neutral,
        p: lgUp ? `${SPACING}px` : 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        minWidth: 0, // Allows flex item to shrink below content width
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: lgUp ? 1.5 : 0,
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden',
          boxShadow: lgUp ? theme.shadows[1] : 'none',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          ...sx,
        }}
        {...other}
      >
        {title && (
          <>
            <Stack direction="row" alignItems="center" sx={{ px: 2.5, py: 0.5, minHeight: 42 }}>
              {(!lgUp || lgUp) && (
                <>
                  <IconButton
                    onClick={lgUp ? handleToggleNav : onOpenNav}
                    sx={{
                      p: 0.5,
                      width: 40,
                      height: 40,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Iconify 
                      icon="meteor-icons:sidebar" 
                      width={16}
                    />
                  </IconButton>
                  <Divider 
                    orientation="vertical" 
                    flexItem 
                    sx={{ 
                      mx: 1.5, 
                      height: 16,
                      alignSelf: 'center',
                    }} 
                  />
                </>
              )}
              <Typography variant="body1" component="h1" fontWeight={500} sx={{ fontSize: '0.95rem', ml: 0.5, color: theme.palette.text.primary }}>
                {title}
              </Typography>
            </Stack>
            <Divider />
          </>
        )}
        <Box sx={{ p: lgUp ? 2.5 : 1.5, flex: 1, overflow: 'auto', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  onOpenNav: PropTypes.func,
  sx: PropTypes.object,
};
