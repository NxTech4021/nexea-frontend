import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useResponsive } from 'src/hooks/use-responsive';

import { bgGradient } from 'src/theme/css';
import { typography } from 'src/theme/typography';

import Logo from 'src/components/logo';

// ----------------------------------------------------------------------

export default function AuthClassicLayout({ children, image, title }) {
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        // position: 'absolute',
        // m: { xs: 2, md: 5 },
        mt: 10,
      }}
    />
  );

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 2, md: 8 },
        pt: { xs: 5, md: 10 },
        pb: { xs: 15, md: 0 },
      }}
    >
      {children}
    </Stack>
  );

  const renderSection = (
    <Stack
      flexGrow={1}
      spacing={10}
      alignItems="center"
      justifyContent="center"
      sx={{
        ...bgGradient({
          color: alpha(
            theme.palette.background.default,
            theme.palette.mode === 'light' ? 0.88 : 0.94
          ),
          imgUrl: '/assets/background/overlay_2.jpg',
        }),
      }}
    >
      <Typography
        variant="h3"
        sx={{
          maxWidth: 480,
          textAlign: 'center',
          fontFamily: typography.fontTertiaryFamily,
        }}
      >
        {title || 'Welcome to Nexea Event App'}
      </Typography>

      <Box
        component="img"
        alt="nexea"
        src="/assets/images/nexea.jpeg"
        sx={{
          borderRadius: 10,
          p: 2,
          animation: 'width-increase 1s ease-in-out',
          '@keyframes width-increase': {
            '0%': {
              scale: 0,
            },
            '100%': {
              scale: 1,
            },
          },
        }}
      />
    </Stack>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      {renderLogo}

      {renderContent}
    </Box>

    // <Stack
    //   component="main"
    //   direction="row"
    // sx={{
    //   minHeight: '100vh',
    // }}
    // >
    //   {renderLogo}

    //   {mdUp && renderSection}

    //   {renderContent}
    // </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string,
};
