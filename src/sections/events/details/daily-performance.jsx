import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import { Box, useTheme, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';

const DailyPerformance = ({ trendData }) => {
  const theme = useTheme();

  // functions
  const getTrendBackgroundColor = (trend) => {
    if (trend.isNeutral) {
      return `${theme.palette.grey[500]}15`;
    }
    return trend.isPositive 
      ? `${theme.palette.success.main}15` 
      : `${theme.palette.error.main}15`;
  };

  const getTrendColor = (trend) => {
    if (trend.isNeutral) {
      return theme.palette.grey[600];
    }
    return trend.isPositive 
      ? theme.palette.success.main 
      : theme.palette.error.main;
  };

  const getTrendIcon = (trend) => {
    if (trend.isNeutral) {
      return '→';
    }
    return trend.isPositive ? '↗' : '↘';
  };

  const getTrendPercentage = (trend, decimalPlaces = 1) => {
    if (trend.isNeutral) {
      return '0%';
    }
    return `${Math.abs(trend.percentage).toFixed(decimalPlaces)}%`;
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify 
              icon="eva:calendar-outline" 
              sx={{ 
                width: 16, 
                height: 16, 
                color: theme.palette.text.secondary 
              }} 
            />
            <Typography
              fontSize={12}
              color={theme.palette.text.secondary}
              fontWeight={600}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Daily Performance
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            px: 1.5,
            py: 0.5,
            bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b',
            borderRadius: 1,
            border: `1px solid ${theme.palette.mode === 'light' ? '#e2e8f0' : '#334155'}`
          }}>
            <Typography
              fontSize={10}
              color={theme.palette.text.secondary}
              fontWeight={500}
            >
              {dayjs().subtract(1, 'day').format('MMM D')}
            </Typography>
            <Typography
              fontSize={10}
              color={theme.palette.text.disabled}
              fontWeight={400}
            >
              vs
            </Typography>
            <Typography
              fontSize={10}
              color={theme.palette.text.primary}
              fontWeight={600}
            >
              {dayjs().format('MMM D')}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: '1fr', 
          md: '1fr', 
          lg: '1fr', 
          xl: 'repeat(3, 1fr)' 
        }, 
        gap: 2,
        alignItems: 'stretch'
      }}>
        {/* Revenue Comparison */}
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 80
        }}>
          <Typography fontSize={11} color={theme.palette.text.secondary} fontWeight={500} sx={{ mb: 1 }}>
            Revenue
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
            <Typography fontSize={14} fontWeight={700} color={theme.palette.text.primary}>
              {trendData.revenue.isPositive && trendData.revenue.change > 0 ? '+' : ''}{new Intl.NumberFormat('en-MY', {
                minimumFractionDigits: 2,
                style: 'currency',
                currency: 'MYR',
              }).format(trendData.revenue.change)}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.25,
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: getTrendBackgroundColor(trendData.revenue)
            }}>
              <Typography
                fontSize={9}
                fontWeight={600}
                color={getTrendColor(trendData.revenue)}
              >
                {getTrendIcon(trendData.revenue)}
              </Typography>
              <Typography
                fontSize={9}
                fontWeight={600}
                color={getTrendColor(trendData.revenue)}
              >
                {getTrendPercentage(trendData.revenue, 1)}
              </Typography>
            </Box>
          </Box>
          <Typography fontSize={10} color={theme.palette.text.secondary}>
            vs yesterday
          </Typography>
        </Box>
        
        {/* Orders Comparison */}
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 80
        }}>
          <Typography fontSize={11} color={theme.palette.text.secondary} fontWeight={500} sx={{ mb: 1 }}>
            Paid Orders
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
            <Typography fontSize={14} fontWeight={700} color={theme.palette.text.primary}>
              {trendData.orders.isPositive && trendData.orders.change > 0 ? '+' : ''}{trendData.orders.change}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.25,
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: getTrendBackgroundColor(trendData.orders)
            }}>
              <Typography
                fontSize={9}
                fontWeight={600}
                color={getTrendColor(trendData.orders)}
              >
                {getTrendIcon(trendData.orders)}
              </Typography>
              <Typography
                fontSize={9}
                fontWeight={600}
                color={getTrendColor(trendData.orders)}
              >
                {getTrendPercentage(trendData.orders, 0)}
              </Typography>
            </Box>
          </Box>
          <Typography fontSize={10} color={theme.palette.text.secondary}>
            vs yesterday
          </Typography>
        </Box>
        
        {/* Registrations Comparison */}
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 80
        }}>
          <Typography fontSize={11} color={theme.palette.text.secondary} fontWeight={500} sx={{ mb: 1 }}>
            Registrations
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
            <Typography fontSize={14} fontWeight={700} color={theme.palette.text.primary}>
              {trendData.registrations.isPositive && trendData.registrations.change > 0 ? '+' : ''}{trendData.registrations.change}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.25,
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: getTrendBackgroundColor(trendData.registrations)
            }}>
              <Typography
                fontSize={9}
                fontWeight={600}
                color={getTrendColor(trendData.registrations)}
              >
                {getTrendIcon(trendData.registrations)}
              </Typography>
              <Typography
                fontSize={9}
                fontWeight={600}
                color={getTrendColor(trendData.registrations)}
              >
                {getTrendPercentage(trendData.registrations, 0)}
              </Typography>
            </Box>
          </Box>
          <Typography fontSize={10} color={theme.palette.text.secondary}>
            vs yesterday
          </Typography>
        </Box>
        
      </Box>
    </Box>
  );
};

DailyPerformance.propTypes = {
  trendData: PropTypes.shape({
    revenue: PropTypes.shape({
      change: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
      isPositive: PropTypes.bool.isRequired,
      isNeutral: PropTypes.bool.isRequired,
    }).isRequired,
    orders: PropTypes.shape({
      change: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
      isPositive: PropTypes.bool.isRequired,
      isNeutral: PropTypes.bool.isRequired,
    }).isRequired,
    registrations: PropTypes.shape({
      change: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
      isPositive: PropTypes.bool.isRequired,
      isNeutral: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

export default DailyPerformance;
