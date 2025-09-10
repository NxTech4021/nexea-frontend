import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import Grid from '@mui/material/Grid2';
import {
  Box,
  Card,
  Chip,
  Stack,
  alpha,
  Divider,
  Tooltip,
  useTheme,
  Typography,
  CardContent,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

import TotalTickets from './total-tickets';
import RevenueOrders from './revenue-orders';

const StatCard = ({ title, value, subtitle, color }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        border: 1,
        borderColor: theme.palette.divider,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        backgroundImage:
          theme.palette.mode === 'light'
            ? 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)'
            : 'none',
      }}
    >
      <CardContent>
        <Stack spacing={0}>
          <Typography fontSize={14} color={theme.palette.text.secondary} fontWeight={400}>
            {title}
          </Typography>
          <Typography color={theme.palette.text.primary} fontSize={28} fontWeight={700}>
            {value}
          </Typography>
          {subtitle && (
            <Typography fontSize={14} color={theme.palette.text.primary} fontWeight={400} mt={2}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  color: PropTypes.string,
};

// Helper function to generate tooltip messages
const getTooltipMessage = (ticketType, status, isAddOn) => {
  const itemType = isAddOn ? 'add-on' : 'ticket';
  const filterType = isAddOn ? 'add-on' : 'ticket type';
  
  if (status === 'total') {
    return `Click to filter attendees by ${filterType}: ${ticketType}`;
  }
  
  return `Click to filter attendees by ${filterType}: ${ticketType} (${status} only)`;
};

const ModernTable = ({ data: breakdownData, title, isAddOn = false, eventId }) => {
  const theme = useTheme();
  const router = useRouter();
  
  const entries = Object.entries(breakdownData);
  const filteredEntries = entries;
  
  // Always show all columns
  const visibleColumns = ['type', 'paid', 'free', 'total', 'revenue'];
  
  // Fixed column widths for 5-column layout
  const columnWidths = {
    type: '35%',
    paid: '16.25%',
    free: '16.25%',
    total: '16.25%',
    revenue: '16.25%'
  };

  // Theme-aware colors
  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;
  const hoverBg = theme.palette.action.hover;
  const borderColor = theme.palette.divider;

  // Handle clicks on paid/free/total numbers
  const handleNumberClick = (ticketType, status) => {
    console.log('Click handler triggered:', { ticketType, status, eventId, isAddOn });
    
    if (!eventId) {
      console.error('No eventId provided');
      return;
    }
    
    // Navigate to event-attendee page with filters
    const attendeeUrl = `/dashboard/events/attendees/${eventId}`;
    
    // Create URL with search params for filtering
    const url = new URL(attendeeUrl, window.location.origin);
    
    if (isAddOn) {
      // For add-ons table, filter by ticketAddOn instead of ticketType
      url.searchParams.set('ticketAddOn', ticketType);
      
      if (status === 'total') {
        // For total, only filter by add-on, no status filter
        // Show ticketAddOn column for context
        url.searchParams.set('showColumns', 'ticketAddOn');
      } else {
        // For paid or free, show only that add-on status
        url.searchParams.set('addOnStatus', status);
        // Show relevant columns automatically
        url.searchParams.set('showColumns', 'addOnStatus');
      }
    } else {
      // For tickets table, use original logic
      url.searchParams.set('ticketType', ticketType);
      
      if (status === 'total') {
        // For total, only filter by ticket type, no status filter
        // Show ticketType column for context
        url.searchParams.set('showColumns', 'ticketType');
      } else {
        // For paid or free, show only that status
        url.searchParams.set('ticketStatus', status);
        // Show relevant columns automatically
        url.searchParams.set('showColumns', 'ticketStatus');
      }
    }
    
    const finalUrl = url.pathname + url.search;
    console.log('Navigating to:', finalUrl);
    
    router.push(finalUrl);
  };
  const cardBgColor = theme.palette.background.paper;

  if (entries.length === 0) {
    return (
      <Card sx={{ 
          border: 1,
          borderColor: theme.palette.divider,
        borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'light' 
          ? '0 1px 3px rgba(0, 0, 0, 0.05)'
          : '0 1px 3px rgba(0, 0, 0, 0.2)',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography fontSize={16} color={theme.palette.text.primary} fontWeight={600} sx={{ mb: 3 }}>
            {title}
          </Typography>
          <Box sx={{ 
            py: 8, 
            textAlign: 'center',
            color: theme.palette.text.secondary
          }}>
            <Typography variant="body2" fontSize={14}>
              No data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
        border: 1,
        borderColor: theme.palette.divider,
      borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
      boxShadow: theme.palette.mode === 'light' 
        ? '0 1px 3px rgba(0, 0, 0, 0.05)'
        : '0 1px 3px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
    }}>
      {/* Header with Title */}
      <Box sx={{ p: 3, pb: 0 }}>
          <Typography fontSize={16} color={theme.palette.text.primary} fontWeight={600}>
            {title}
          </Typography>
      </Box>
      
      <Divider sx={{ mt: 3, borderColor: alpha(theme.palette.divider, 0.5) }} />
      
      {/* Table Content */}
      <Box sx={{ overflow: 'hidden' }}>
        {filteredEntries.length === 0 ? (
          <Box sx={{ 
            py: 6, 
            px: 3,
                  textAlign: 'center',
            color: theme.palette.text.secondary
          }}>
                        <Typography variant="body2" fontSize={14}>
              No data available
            </Typography>
          </Box>
        ) : (
          <>
            {/* Desktop Header */}
            <Box
                sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                px: 3,
                py: 1.5,
                bgcolor: theme.palette.mode === 'light' ? '#fafafa' : '#1e1e1e',
                borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#e4e4e7' : '#27272a'}`,
              }}
            >
              {visibleColumns.includes('type') && (
                <Typography sx={{ 
                  width: visibleColumns.length === 3 ? columnWidths.type : columnWidths.type, 
                  color: theme.palette.mode === 'light' ? '#71717a' : '#a1a1aa', 
                  fontWeight: 500, 
                  fontSize: '0.75rem',
                  letterSpacing: '0.025em',
                  textTransform: 'uppercase'
                }}>
                  TYPE
              </Typography>
              )}
              {visibleColumns.includes('paid') && (
                <Typography sx={{ 
                  width: columnWidths.paid, 
                  color: theme.palette.mode === 'light' ? '#71717a' : '#a1a1aa',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  letterSpacing: '0.025em',
                  textTransform: 'uppercase',
                  textAlign: 'center' 
                }}>
                  PAID
              </Typography>
              )}
              {visibleColumns.includes('free') && (
                <Typography sx={{ 
                  width: columnWidths.free, 
                  color: theme.palette.mode === 'light' ? '#71717a' : '#a1a1aa',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  letterSpacing: '0.025em',
                  textTransform: 'uppercase',
                  textAlign: 'center' 
                }}>
                  FREE
              </Typography>
              )}
              {visibleColumns.includes('total') && (
                <Typography sx={{ 
                  width: columnWidths.total, 
                  color: theme.palette.mode === 'light' ? '#71717a' : '#a1a1aa',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  letterSpacing: '0.025em',
                  textTransform: 'uppercase',
                  textAlign: 'center' 
                }}>
                  TOTAL
              </Typography>
              )}
              {visibleColumns.includes('revenue') && (
                <Typography sx={{ 
                  width: visibleColumns.length === 3 ? columnWidths.revenue : columnWidths.revenue, 
                  color: textColor,
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'right' 
                }}>
                  REVENUE
              </Typography>
              )}
            </Box>

            {/* Data Rows */}
            <Box>
              {filteredEntries.map(([type, stats], index) => (
                <Box
                  key={type}
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: index === filteredEntries.length - 1 ? 'none' : `1px solid ${theme.palette.mode === 'light' ? '#e4e4e7' : '#27272a'}`,
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? '#f9fafb' : '#1f2937',
                    },
                  }}
                >
                  {/* Mobile Layout */}
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <Stack spacing={3}>
                      {/* Header Section */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              color: textColor,
                              fontWeight: 600,
                              fontSize: { xs: 14, sm: 15 },
                              lineHeight: 1.3,
                              wordBreak: 'break-word',
                              flex: 1
                            }}
                          >
                            {type}
                          </Typography>
                          {isAddOn && (
                            <Chip
                              label="Add-on"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                                bgcolor: 'transparent',
                                color: '#737373',
                                border: '1px solid #E5E5E5',
                                '& .MuiChip-label': { px: 1 },
                                flexShrink: 0
                              }}
                            />
                          )}
                        </Stack>
                        <Typography sx={{ 
                          color: theme.palette.success.main, 
                          fontSize: { xs: 14, sm: 15 }, 
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          flexShrink: 0
                        }}>
                          RM {stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>

                      {/* Stats Section - Grid Layout for Better Mobile Experience */}
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                        gap: 2,
                        mt: 1
                      }}>
                        {visibleColumns.includes('paid') && (
                          <Tooltip title={getTooltipMessage(type, 'paid', isAddOn)} arrow placement="top">
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'flex-start',
                              gap: 1,
                              p: 2,
                              borderRadius: 1.5,
                              bgcolor: theme.palette.mode === 'light' ? 'rgba(34, 154, 22, 0.04)' : 'rgba(34, 154, 22, 0.08)',
                              border: '1px solid rgba(34, 154, 22, 0.15)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(34, 154, 22, 0.08)' : 'rgba(34, 154, 22, 0.12)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(34, 154, 22, 0.2)'
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                              }
                            }}
                            onClick={() => handleNumberClick(type, 'paid')}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify icon="eva:checkmark-circle-2-fill" sx={{ width: 12, height: 12, color: '#229A16' }} />
                                <Typography sx={{ 
                                  color: '#229A16', 
                                  fontSize: 11, 
                                  fontWeight: 600, 
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Paid
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                color: '#229A16', 
                                fontSize: { xs: 20, sm: 22 }, 
                                fontWeight: 700,
                                lineHeight: 1
                              }}>
                                {stats.paidQuantity}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {visibleColumns.includes('free') && (
                          <Tooltip title={getTooltipMessage(type, 'free', isAddOn)} arrow placement="top">
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'flex-start',
                              gap: 1,
                              p: 2,
                              borderRadius: 1.5,
                              bgcolor: theme.palette.mode === 'light' ? 'rgba(33, 150, 243, 0.04)' : 'rgba(33, 150, 243, 0.08)',
                              border: '1px solid rgba(33, 150, 243, 0.15)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(33, 150, 243, 0.08)' : 'rgba(33, 150, 243, 0.12)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)'
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                              }
                            }}
                            onClick={() => handleNumberClick(type, 'free')}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify icon="eva:gift-outline" sx={{ width: 12, height: 12, color: '#2196F3' }} />
                                <Typography sx={{ 
                                  color: '#2196F3', 
                                  fontSize: 11, 
                                  fontWeight: 600, 
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Free
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                color: '#2196F3', 
                                fontSize: { xs: 20, sm: 22 }, 
                                fontWeight: 700,
                                lineHeight: 1
                              }}>
                                {stats.freeQuantity}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {visibleColumns.includes('total') && (
                          <Tooltip title={getTooltipMessage(type, 'total', isAddOn)} arrow placement="top">
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'flex-start',
                              gap: 1,
                              p: 2,
                              borderRadius: 1.5,
                              bgcolor: theme.palette.mode === 'light' ? 'rgba(115, 115, 115, 0.04)' : 'rgba(115, 115, 115, 0.08)',
                              border: '1px solid rgba(115, 115, 115, 0.15)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              gridColumn: { xs: 'span 2', sm: 'span 1' },
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(115, 115, 115, 0.08)' : 'rgba(115, 115, 115, 0.12)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(115, 115, 115, 0.2)'
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                              }
                            }}
                            onClick={() => handleNumberClick(type, 'total')}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify icon="eva:hash-outline" sx={{ width: 12, height: 12, color: '#737373' }} />
                                <Typography sx={{ 
                                  color: '#737373', 
                                  fontSize: 11, 
                                  fontWeight: 600, 
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Total
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                color: '#737373', 
                                fontSize: { xs: 20, sm: 22 }, 
                                fontWeight: 700,
                                lineHeight: 1
                              }}>
                                {stats.paidQuantity + stats.freeQuantity}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  {/* Tablet Layout */}
                  <Box sx={{ display: { xs: 'none', sm: 'block', md: 'none' } }}>
                    <Stack spacing={2}>
                      {/* Header Section for Tablet */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Typography
                            sx={{
                              color: textColor,
                              fontWeight: 600,
                              fontSize: 16
                            }}
                          >
                            {type}
                          </Typography>
                          {isAddOn && (
                            <Chip
                              label="Add-on"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                bgcolor: 'transparent',
                                color: '#737373',
                                border: '1px solid #E5E5E5',
                                '& .MuiChip-label': { px: 1.5 }
                              }}
                            />
                          )}
                        </Stack>
                        <Typography sx={{ 
                          color: theme.palette.success.main, 
                          fontSize: 16, 
                          fontWeight: 700,
                          letterSpacing: '-0.01em'
                        }}>
                          RM {stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>

                      {/* Stats Row for Tablet */}
                      <Box sx={{ 
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-start',
                        flexWrap: 'wrap'
                      }}>
                        {visibleColumns.includes('paid') && (
                          <Tooltip title={getTooltipMessage(type, 'paid', isAddOn)} arrow placement="top">
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(34, 154, 22, 0.04)' : 'rgba(34, 154, 22, 0.08)',
                                border: '1px solid rgba(34, 154, 22, 0.15)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                minWidth: 'fit-content',
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'light' ? 'rgba(34, 154, 22, 0.08)' : 'rgba(34, 154, 22, 0.12)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 8px rgba(34, 154, 22, 0.2)'
                                },
                                '&:active': {
                                  transform: 'translateY(0)',
                                }
                              }}
                              onClick={() => handleNumberClick(type, 'paid')}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify icon="eva:checkmark-circle-2-fill" sx={{ width: 14, height: 14, color: '#229A16' }} />
                                <Typography sx={{ 
                                  color: '#229A16', 
                                  fontSize: 12, 
                                  fontWeight: 600, 
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Paid
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                color: '#229A16', 
                                fontSize: 18, 
                                fontWeight: 700,
                                lineHeight: 1
                              }}>
                                {stats.paidQuantity}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {visibleColumns.includes('free') && (
                          <Tooltip title={getTooltipMessage(type, 'free', isAddOn)} arrow placement="top">
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(33, 150, 243, 0.04)' : 'rgba(33, 150, 243, 0.08)',
                                border: '1px solid rgba(33, 150, 243, 0.15)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                minWidth: 'fit-content',
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'light' ? 'rgba(33, 150, 243, 0.08)' : 'rgba(33, 150, 243, 0.12)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)'
                                },
                                '&:active': {
                                  transform: 'translateY(0)',
                                }
                              }}
                              onClick={() => handleNumberClick(type, 'free')}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify icon="eva:gift-outline" sx={{ width: 14, height: 14, color: '#2196F3' }} />
                                <Typography sx={{ 
                                  color: '#2196F3', 
                                  fontSize: 12, 
                                  fontWeight: 600, 
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Free
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                color: '#2196F3', 
                                fontSize: 18, 
                                fontWeight: 700,
                                lineHeight: 1
                              }}>
                                {stats.freeQuantity}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {visibleColumns.includes('total') && (
                          <Tooltip title={getTooltipMessage(type, 'total', isAddOn)} arrow placement="top">
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(115, 115, 115, 0.04)' : 'rgba(115, 115, 115, 0.08)',
                                border: '1px solid rgba(115, 115, 115, 0.15)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                minWidth: 'fit-content',
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'light' ? 'rgba(115, 115, 115, 0.08)' : 'rgba(115, 115, 115, 0.12)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 8px rgba(115, 115, 115, 0.2)'
                                },
                                '&:active': {
                                  transform: 'translateY(0)',
                                }
                              }}
                              onClick={() => handleNumberClick(type, 'total')}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify icon="eva:hash-outline" sx={{ width: 14, height: 14, color: '#737373' }} />
                                <Typography sx={{ 
                                  color: '#737373', 
                                  fontSize: 12, 
                                  fontWeight: 600, 
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Total
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                color: '#737373', 
                                fontSize: 18, 
                                fontWeight: 700,
                                lineHeight: 1
                              }}>
                                {stats.paidQuantity + stats.freeQuantity}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  {/* Desktop Layout */}
                  <Box sx={{ 
                      display: { xs: 'none', md: 'flex' },
                    alignItems: 'center' 
                  }}>
                    {visibleColumns.includes('type') && (
                      <Box sx={{ 
                        width: visibleColumns.length === 3 ? columnWidths.type : columnWidths.type, 
                        display: 'flex', 
                      alignItems: 'center',
                        gap: 1.5 
                      }}>
                    <Typography
                      sx={{
                        color: textColor,
                            fontWeight: 600, 
                        fontSize: 14,
                            letterSpacing: '-0.01em'
                      }}
                    >
                      {type}
                    </Typography>
                    {isAddOn && (
                      <Chip
                        label="Add-on"
                        size="small"
                        sx={{
                              height: 22,
                              fontSize: '0.7rem',
                          fontWeight: 500,
                          bgcolor: 'transparent',
                          color: '#737373',
                              border: '1px solid #E5E5E5',
                              '& .MuiChip-label': { px: 1.5 },
                          '&:hover': {
                                bgcolor: 'rgba(115, 115, 115, 0.08)',
                              }
                        }}
                      />
                    )}
                  </Box>
                    )}
                    
                    {visibleColumns.includes('paid') && (
                      <Box sx={{ width: columnWidths.paid, display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title={getTooltipMessage(type, 'paid', isAddOn)} arrow placement="top">
                          <Chip
                            icon={<Iconify icon="eva:checkmark-circle-2-fill" sx={{ width: 16, height: 16 }} />}
                            label={stats.paidQuantity}
                            size="small"
                            clickable
                            onClick={() => handleNumberClick(type, 'paid')}
                      sx={{
                              height: 26,
                          fontSize: '0.75rem',
                              fontWeight: 600,
                              bgcolor: 'rgba(34, 154, 22, 0.08)',
                              color: '#229A16',
                              border: '1px solid rgba(34, 154, 22, 0.2)',
                              cursor: 'pointer',
                              '& .MuiChip-label': { px: 1.5 },
                              '& .MuiChip-icon': {
                                color: '#229A16',
                                ml: 0.5,
                              },
                              '&:hover': {
                                bgcolor: 'rgba(34, 154, 22, 0.15)',
                              }
                        }}
                          />
                        </Tooltip>
                    </Box>
                    )}
                    
                    {visibleColumns.includes('free') && (
                      <Box sx={{ width: columnWidths.free, display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title={getTooltipMessage(type, 'free', isAddOn)} arrow placement="top">
                          <Chip
                            icon={<Iconify icon="eva:gift-outline" sx={{ width: 16, height: 16 }} />}
                            label={stats.freeQuantity}
                            size="small"
                            clickable
                            onClick={() => handleNumberClick(type, 'free')}
                      sx={{
                              height: 26,
                          fontSize: '0.75rem',
                              fontWeight: 600,
                              bgcolor: 'rgba(33, 150, 243, 0.08)',
                              color: '#2196F3',
                              border: '1px solid rgba(33, 150, 243, 0.2)',
                              cursor: 'pointer',
                              '& .MuiChip-label': { px: 1.5 },
                              '& .MuiChip-icon': {
                                color: '#2196F3',
                                ml: 0.5,
                              },
                              '&:hover': {
                                bgcolor: 'rgba(33, 150, 243, 0.15)',
                              }
                        }}
                          />
                        </Tooltip>
                    </Box>
                    )}
                    
                    {visibleColumns.includes('total') && (
                      <Box sx={{ width: columnWidths.total, display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title={getTooltipMessage(type, 'total', isAddOn)} arrow placement="top">
                          <Chip
                            icon={<Iconify icon="eva:hash-outline" sx={{ width: 16, height: 16 }} />}
                            label={stats.paidQuantity + stats.freeQuantity}
                            size="small"
                            clickable
                            onClick={() => handleNumberClick(type, 'total')}
                      sx={{
                              height: 26,
                          fontSize: '0.75rem',
                              fontWeight: 600,
                              bgcolor: 'transparent',
                              color: '#737373',
                              border: '1px solid #E5E5E5',
                              cursor: 'pointer',
                              '& .MuiChip-label': { px: 1.5 },
                              '& .MuiChip-icon': {
                                color: '#737373',
                                ml: 0.5,
                              },
                              '&:hover': {
                                bgcolor: 'rgba(115, 115, 115, 0.08)',
                              }
                        }}
                          />
                        </Tooltip>
                    </Box>
                    )}
                    
                    {visibleColumns.includes('revenue') && (
                      <Box sx={{ 
                        width: visibleColumns.length === 3 ? columnWidths.revenue : columnWidths.revenue, 
                        display: 'flex', 
                        justifyContent: 'flex-end' 
                      }}>
                        <Typography 
                    sx={{
                            color: textColor,
                        fontWeight: 600,
                            fontSize: 14,
                            letterSpacing: '-0.01em'
                          }}
                        >
                          RM {stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                    )}
                  </Box>
                </Box>
              ))}
          </Box>
          </>
        )}
      </Box>
      

    </Card>
  );
};

ModernTable.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  isAddOn: PropTypes.bool,
  eventId: PropTypes.string,
};

const EventStatistics = ({ data, eventId }) => {
  const theme = useTheme();
  const [revenueTimeRange, setRevenueTimeRange] = useState(7); // Default to 7 days

  // Calculate all orders with 'paid' status (includes both paid and free)
  const paidStatusOrders = useMemo(() => 
    data?.order?.filter((order) => order?.status === 'paid') || [], [data?.order]);

  // Filter orders based on time range
  const filteredOrders = useMemo(() => {
    if (revenueTimeRange === 'all') {
      return paidStatusOrders;
    }
    
    const now = dayjs();
    const cutoffDate = now.subtract(revenueTimeRange, 'day');
    
    return paidStatusOrders.filter((order) => 
      dayjs(order.createdAt).isAfter(cutoffDate)
    );
  }, [paidStatusOrders, revenueTimeRange]);

  // Separate paid and free orders based on totalAmount
  const paidOrders = useMemo(() => 
    filteredOrders.filter((order) => Number(order.totalAmount) > 0), [filteredOrders]);
  const freeOrders = useMemo(() => 
    filteredOrders.filter((order) => Number(order.totalAmount) === 0), [filteredOrders]);

  // Get all attendees from filtered orders (for revenue/orders charts)
  const allAttendees = useMemo(() => 
    filteredOrders.flatMap((order) => order.attendees) || [], [filteredOrders]);
  const paidAttendees = useMemo(() => 
    paidOrders.flatMap((order) => order.attendees) || [], [paidOrders]);
  const freeAttendees = useMemo(() => 
    freeOrders.flatMap((order) => order.attendees) || [], [freeOrders]);

  // Get all attendees from ALL orders (for ticket breakdown tables - not affected by time range)
  const allTimeAllAttendees = useMemo(() => 
    paidStatusOrders.flatMap((order) => order.attendees) || [], [paidStatusOrders]);
  const allTimePaidAttendees = useMemo(() => 
    paidStatusOrders.filter((order) => Number(order.totalAmount) > 0)
      .flatMap((order) => order.attendees) || [], [paidStatusOrders]);

  // 1. Revenue of paid tickets
  const paidTicketRevenue = paidAttendees.reduce((acc, attendee) => {
    const ticketPrice = attendee.ticket?.price || 0;
    const addOnPrice = attendee.ticket?.ticketAddOn?.price || 0;
    return acc + ticketPrice + addOnPrice;
  }, 0);

  // 2. Revenue of paid orders
  const paidOrderRevenue = paidOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

  // 3. Quantity of all paid tickets
  const paidTicketQuantity = paidAttendees.length;

  // 4. Quantity of all free tickets
  const freeTicketQuantity = freeAttendees.length;

  // Calculate daily trends and percentage changes
  const calculateTrend = (currentData, previousData) => {
    if (!previousData || previousData === 0) {
      // If no previous data, show neutral if current is also 0, otherwise show as new
      return { 
        change: currentData, 
        percentage: 0, 
        isPositive: currentData > 0, 
        isNeutral: currentData === 0 
      };
    }
    const change = currentData - previousData;
    const percentage = previousData > 0 ? (change / previousData) * 100 : 0;
    return { 
      change, 
      percentage, 
      isPositive: change > 0, 
      isNeutral: change === 0 
    };
  };

  // Get data for trend calculation (last 2 days)
  const getTrendData = () => {
    const now = dayjs();
    const today = now.format('YYYY-MM-DD');
    const yesterday = now.subtract(1, 'day').format('YYYY-MM-DD');
    
    // Revenue trends
    const todayRevenue = paidOrders
      .filter(order => dayjs(order.createdAt).format('YYYY-MM-DD') === today)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const yesterdayRevenue = paidOrders
      .filter(order => dayjs(order.createdAt).format('YYYY-MM-DD') === yesterday)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Orders trends
    const todayOrders = paidOrders.filter(order => 
      dayjs(order.createdAt).format('YYYY-MM-DD') === today
    ).length;
    const yesterdayOrders = paidOrders.filter(order => 
      dayjs(order.createdAt).format('YYYY-MM-DD') === yesterday
    ).length;
    
    // Registrations trends
    const todayRegistrations = [
      ...paidOrders.filter(order => dayjs(order.createdAt).format('YYYY-MM-DD') === today),
      ...freeOrders.filter(order => dayjs(order.createdAt).format('YYYY-MM-DD') === today)
    ].reduce((sum, order) => sum + (order.attendees?.length || 0), 0);
    
    const yesterdayRegistrations = [
      ...paidOrders.filter(order => dayjs(order.createdAt).format('YYYY-MM-DD') === yesterday),
      ...freeOrders.filter(order => dayjs(order.createdAt).format('YYYY-MM-DD') === yesterday)
    ].reduce((sum, order) => sum + (order.attendees?.length || 0), 0);
    
    return {
      revenue: calculateTrend(todayRevenue, yesterdayRevenue),
      orders: calculateTrend(todayOrders, yesterdayOrders),
      registrations: calculateTrend(todayRegistrations, yesterdayRegistrations),
      todayValues: {
        revenue: todayRevenue,
        orders: todayOrders,
        registrations: todayRegistrations
      }
    };
  };

  const trendData = getTrendData();


  // Calculate add-ons quantity (time-filtered data for TotalTickets component)
  const addOnsQuantity = allAttendees.filter(
    (attendee) => attendee.ticket?.ticketAddOn?.addOn
  ).length;



  // Group tickets by type for detailed breakdown
  const ticketTypeBreakdown = useMemo(() => {
    // Initialize with all ticket types from the event 
    const breakdown = {};
    
    // Add all ticket types from the event
    (data?.ticketType || []).forEach((ticketType) => {
      breakdown[ticketType.title] = {
        paidQuantity: 0,
        freeQuantity: 0,
        revenue: 0,
      };
    });
    
    // Now process attendees to populate the data (using all-time data)
    allTimeAllAttendees.forEach((attendee) => {
      const ticketType = attendee.ticket?.ticketType?.title;
      const attendeeOrder = paidStatusOrders.find((order) =>
        order.attendees.some((orderAttendee) => orderAttendee.id === attendee.id)
      );

      // Check if this attendee is from a paid or free order (using all-time data)
      const isFromPaidOrder = allTimePaidAttendees.includes(attendee);

      if (!ticketType || !attendeeOrder) return;

      // Ensure the ticket type exists in breakdown (should already exist from above)
      if (!breakdown[ticketType]) {
        breakdown[ticketType] = {
          paidQuantity: 0,
          freeQuantity: 0,
          revenue: 0,
        };
      }

      if (isFromPaidOrder) {
        breakdown[ticketType].paidQuantity += 1;
        
        // Calculate ticket revenue: actual ticket price after discount + ALL tax
        // (since discount only applies to tickets, tickets should bear all tax burden)
        const actualTicketPrice = attendee.ticket?.price || 0; // This is already the discounted price
        
        // Calculate order totals to get total tax
        const orderTicketTotal = attendeeOrder.attendees.reduce((sum, orderAttendee) => 
          sum + (orderAttendee.ticket?.price || 0), 0);
        const orderAddOnTotal = attendeeOrder.attendees.reduce((sum, orderAttendee) => 
          sum + (orderAttendee.ticket?.ticketAddOn?.price || 0), 0);
        const orderSubtotal = orderTicketTotal + orderAddOnTotal;
        const totalTax = (attendeeOrder.totalAmount || 0) - orderSubtotal;
        
        // Distribute tax among tickets only (since discount only applies to tickets)
        const orderTicketCount = attendeeOrder.attendees.filter(orderAttendee => 
          orderAttendee.ticket?.price && orderAttendee.ticket.price > 0).length;
        const taxPerTicket = orderTicketCount > 0 ? totalTax / orderTicketCount : 0;
        
        // Ticket revenue = actual ticket price + tax share
        breakdown[ticketType].revenue += actualTicketPrice + taxPerTicket;
      } else {
        breakdown[ticketType].freeQuantity += 1;
      }
    });
    
    return breakdown;
  }, [data?.ticketType, allTimeAllAttendees, paidStatusOrders, allTimePaidAttendees]);

  // Add-on tickets breakdown
  const addOnBreakdown = useMemo(() => {
    // Initialize with all add-ons from the event (even those with no orders)
    const breakdown = {};
    
    // Add all add-ons from all ticket types in the event
    (data?.ticketType || []).forEach((ticketType) => {
      (ticketType.addOns || []).forEach((addOn) => {
        breakdown[addOn.name] = {
          paidQuantity: 0,
          freeQuantity: 0,
          revenue: 0,
        };
      });
    });
    
    // Now process attendees to populate the data (using all-time data)
    allTimeAllAttendees.forEach((attendee) => {
      const addOnName = attendee.ticket?.ticketAddOn?.addOn?.name;
      const attendeeOrder = paidStatusOrders.find((order) =>
        order.attendees.some((orderAttendee) => orderAttendee.id === attendee.id)
      );

      // Check if this attendee is from a paid or free order (using all-time data)
      const isFromPaidOrder = allTimePaidAttendees.includes(attendee);

      if (!addOnName || !attendeeOrder) return;

      // Ensure the add-on exists in breakdown (should already exist from above)
      if (!breakdown[addOnName]) {
        breakdown[addOnName] = {
          paidQuantity: 0,
          freeQuantity: 0,
          revenue: 0,
        };
      }

      if (isFromPaidOrder) {
        breakdown[addOnName].paidQuantity += 1;
        
        // Add-on revenue = actual add-on price only (discount codes don't apply to add-ons, no tax included)
        const addOnPrice = attendee.ticket?.ticketAddOn?.price || 0;
        breakdown[addOnName].revenue += addOnPrice;
      } else {
        breakdown[addOnName].freeQuantity += 1;
      }
    });
    
    return breakdown;
  }, [data?.ticketType, allTimeAllAttendees, paidStatusOrders, allTimePaidAttendees]);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={3}>
        {/* Revenue and Tickets Charts */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <RevenueOrders
              paidOrders={paidOrders}
              freeOrders={freeOrders}
              paidOrderRevenue={paidOrderRevenue}
              paidTicketQuantity={paidTicketQuantity}
              freeTicketQuantity={freeTicketQuantity}
              trendData={trendData}
              revenueTimeRange={revenueTimeRange}
              onTimeRangeChange={setRevenueTimeRange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TotalTickets
              paidTicketQuantity={paidTicketQuantity}
              freeTicketQuantity={freeTicketQuantity}
              addOnsQuantity={addOnsQuantity}
              revenueTimeRange={revenueTimeRange}
            />
          </Grid>
        </Grid>

        {/* Ticket Type Breakdown Table */}
        {(Object.keys(ticketTypeBreakdown).length > 0 ||
          Object.keys(addOnBreakdown).length > 0) && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: Object.keys(addOnBreakdown).length > 0 ? 6 : 12 }}>
              <ModernTable data={ticketTypeBreakdown} title="All Tickets" eventId={eventId} />
            </Grid>

            {/* Add-on Breakdown Table */}
            {Object.keys(addOnBreakdown).length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <ModernTable data={addOnBreakdown} title="Add-ons" isAddOn eventId={eventId} />
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

EventStatistics.propTypes = {
  data: PropTypes.object,
  eventId: PropTypes.string,
};

export default EventStatistics;
