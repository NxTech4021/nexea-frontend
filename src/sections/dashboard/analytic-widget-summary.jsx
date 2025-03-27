import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { useTheme } from '@emotion/react';

import { Box, alpha, Typography } from '@mui/material';

import { bgGradient } from 'src/theme/css';

const AnalyticsWidget = ({ title, color, icon, num }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette[color].light, 0.2),
          endColor: alpha(theme.palette[color].main, 0.2),
        }),
        height: 120,
        borderRadius: 2,
        p: 3,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
      }}
    >
      <Icon icon={icon} width={40} color={theme.palette[color].main} opacity={0.7} />
      <Box sx={{ ml: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1" sx={{ opacity: 0.64 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ opacity: 0.8 }}>
          {num}
        </Typography>
      </Box>
    </Box>
  );
};

export default AnalyticsWidget;

AnalyticsWidget.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  num: PropTypes.any,
};
