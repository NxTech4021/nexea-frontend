import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function OneView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Dashboard </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              mt: 5,
              width: 1,
              height: 320,
              borderRadius: 2,
              p: 3,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              // border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            Content 1
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              mt: 5,
              width: 1,
              height: 320,
              borderRadius: 2,
              p: 3,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              // border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            Content 2
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              width: 1,
              height: 320,
              borderRadius: 2,
              p: 3,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              // border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            Content 3
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              width: 1,
              height: 320,
              borderRadius: 2,
              p: 3,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              // border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            Content 4
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
