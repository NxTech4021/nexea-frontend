import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import { 
  GridToolbarExport, 
  GridToolbarContainer, 
  GridToolbarQuickFilter, 
  GridToolbarColumnsButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Button,
  Select,
  Tooltip,
  MenuItem,
  Collapse,
  TextField,
  Typography,
  IconButton,
  FormControl,
  useMediaQuery,
} from '@mui/material';

import Iconify from 'src/components/iconify';

// Custom toolbar component
const CustomToolbar = ({ 
  isFilterExpanded, 
  setIsFilterExpanded, 
  filters, 
  theme, 
  textColor 
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Helper functions to avoid nested ternaries
  const getBackgroundColor = (expanded, isHover = false) => {
    const isLight = theme.palette.mode === 'light';
    
    if (!expanded) {
      if (isHover) {
        return isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)';
      }
      return 'transparent';
    }
    
    if (isHover) {
      return isLight ? 'rgba(25, 118, 210, 0.12)' : 'rgba(144, 202, 249, 0.16)';
    }
    
    return isLight ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.12)';
  };

  return (
    <GridToolbarContainer sx={{ 
      p: isMobile ? 0.5 : 1, 
      display: 'flex', 
      gap: isMobile ? 0.5 : 1,
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      justifyContent: isMobile ? 'center' : 'space-between',
      alignItems: 'center',
    }}>
      {/* Left side - Toolbar buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: isMobile ? 0.5 : 1,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        alignItems: 'center',
      }}>
        {!isMobile && <GridToolbarColumnsButton />}
        
        <Button
          size={isMobile ? "small" : "small"}
          startIcon={<Iconify icon={isFilterExpanded ? "eva:chevron-up-outline" : "eva:funnel-outline"} />}
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          sx={{
            color: isFilterExpanded ? theme.palette.primary.main : textColor,
            textTransform: 'none',
            fontWeight: 500,
            bgcolor: getBackgroundColor(isFilterExpanded),
            minWidth: isMobile ? 'auto' : 'unset',
            px: isMobile ? 1 : 1.5,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            '&:hover': {
              bgcolor: getBackgroundColor(isFilterExpanded, true),
            },
          }}
        >
          {isMobile ? 'Filter' : 'Filters'}
          {filters.length > 0 && (
            <Chip 
              label={filters.length} 
              size="small" 
              sx={{ 
                ml: 1,
                height: isMobile ? 16 : 18, 
                fontSize: isMobile ? '0.65rem' : '0.7rem',
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            />
          )}
        </Button>
        
        {!isMobile && (
          <>
            <GridToolbarDensitySelector />
            <GridToolbarExport />
          </>
        )}
        
        {isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <GridToolbarColumnsButton size="small" />
            <GridToolbarDensitySelector size="small" />
            <GridToolbarExport size="small" />
          </Box>
        )}
      </Box>

      {/* Right side - Search field */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        minWidth: isMobile ? '100%' : 'auto',
        mt: isMobile ? 1 : 0,
        justifyContent: isMobile ? 'center' : 'flex-end',
      }}>
        <GridToolbarQuickFilter
          sx={{
            '& .MuiOutlinedInput-root': {
              height: isMobile ? 36 : 32,
              fontSize: isMobile ? '0.875rem' : '0.8125rem',
              borderRadius: 1,
              minWidth: isMobile ? 200 : 240,
              '& fieldset': {
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
              },
              '& input': {
                py: isMobile ? 1 : 0.75,
                color: textColor,
                '&::placeholder': {
                  color: theme.palette.mode === 'light' ? '#666' : '#aaa',
                  opacity: 0.7,
                },
              },
            },
          }}
          placeholder={isMobile ? "Search..." : "Search attendees..."}
          debounceMs={300}
        />
      </Box>
    </GridToolbarContainer>
  );
};

CustomToolbar.propTypes = {
  isFilterExpanded: PropTypes.bool.isRequired,
  setIsFilterExpanded: PropTypes.func.isRequired,
  filters: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  textColor: PropTypes.string.isRequired,
};

// Main EventFilters component
const EventFilters = ({ 
  data, 
  statusUpdates, 
  onFilteredDataChange,
  isFilterExpanded,
  setIsFilterExpanded,
  eventId, // Add eventId prop for scoped persistence
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Theme-aware colors
  const textColor = theme.palette.mode === 'light' ? '#111' : '#fff';
  const borderColor = theme.palette.mode === 'light' ? '#eee' : '#333';
  const secondaryTextColor = theme.palette.mode === 'light' ? '#666' : '#aaa';

  // Storage key for persisting filters per event
  const FILTERS_STORAGE_KEY = `event-filters-${eventId}`;

  // Helper functions for filter persistence
  const saveFiltersToStorage = (filtersToSave) => {
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  };

  const loadFiltersFromStorage = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      return savedFilters ? JSON.parse(savedFilters) : [];
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
      return [];
    }
  }, [FILTERS_STORAGE_KEY]);

  const clearFiltersFromStorage = () => {
    try {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear filters from localStorage:', error);
    }
  };

  // Advanced filtering state with persistence
  const [filters, setFilters] = useState(() => 
    // Load persisted filters on initial mount
     loadFiltersFromStorage()
  );

  // Auto-expand filter section if persisted filters exist
  useEffect(() => {
    const persistedFilters = loadFiltersFromStorage();
    if (persistedFilters.length > 0 && !isFilterExpanded) {
      setIsFilterExpanded(true);
    }
  }, [setIsFilterExpanded, isFilterExpanded, loadFiltersFromStorage]);

  // Helper function to get background color without nested ternaries
  const getMobileBackgroundColor = () => {
    if (theme.palette.mode === 'light') {
      return 'rgba(0, 0, 0, 0.02)';
    }
    return 'rgba(255, 255, 255, 0.02)';
  };

  const getMobileBorderColor = () => {
    if (theme.palette.mode === 'light') {
      return 'rgba(0, 0, 0, 0.08)';
    }
    return 'rgba(255, 255, 255, 0.08)';
  };

  // Extract unique values from event data
  const getUniqueTicketTypes = () => {
    if (!data?.attendees) return [];
    const types = [...new Set(data.attendees.map(attendee => attendee.ticket.ticketType.title).filter(Boolean))];
    return types.sort();
  };

  const getUniqueAddOns = () => {
    if (!data?.attendees) return [];
    const addOns = [...new Set(data.attendees
      .map(attendee => attendee.ticket.ticketAddOn?.addOn?.name)
      .filter(Boolean))];
    return ['N/A', ...addOns.sort()];
  };

  const getUniqueDiscountCodes = () => {
    if (!data?.attendees) return [];
    const codes = [...new Set(data.attendees
      .map(attendee => attendee.order.discountCode?.code)
      .filter(Boolean))];
    return ['None', ...codes.sort()];
  };

  // Advanced filtering logic
  const filterOptions = [
    { field: 'fullName', label: isMobile ? 'Name' : 'Attendee Name', type: 'text' },
    { field: 'status', label: isMobile ? 'Status' : 'Check-in Status', type: 'select', options: ['checkedIn', 'pending'] },
    { field: 'email', label: 'Email', type: 'text' },
    { field: 'phoneNumber', label: isMobile ? 'Phone' : 'Phone Number', type: 'text' },
    { field: 'companyName', label: isMobile ? 'Company' : 'Company Name', type: 'text' },
    { field: 'ticketType', label: isMobile ? 'Ticket' : 'Ticket Type', type: 'select', options: getUniqueTicketTypes() },
    { field: 'ticketAddOn', label: isMobile ? 'Add-on' : 'Ticket Add On', type: 'select', options: getUniqueAddOns() },
    { field: 'ticketCode', label: isMobile ? 'Code' : 'Ticket Code', type: 'text' },
    { field: 'orderNumber', label: isMobile ? 'Order #' : 'Order Number', type: 'text' },
    { field: 'orderStatus', label: isMobile ? 'Order' : 'Order Status', type: 'select', options: ['paid', 'free'] },
    { field: 'ticketStatus', label: isMobile ? 'Ticket' : 'Ticket Status', type: 'select', options: ['paid', 'free'] },
    { field: 'addOnStatus', label: isMobile ? 'Add-on' : 'Add-on Status', type: 'select', options: ['paid', 'free', 'none'] },
    { field: 'discountCode', label: isMobile ? 'Discount' : 'Discount Code', type: 'select', options: getUniqueDiscountCodes() },
  ];

  const addFilter = () => {
    const newFilter = {
      id: Date.now(),
      field: 'fullName',
      operator: 'contains',
      value: '',
    };
    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    saveFiltersToStorage(updatedFilters);
  };

  const removeFilter = (filterId) => {
    const updatedFilters = filters.filter(filter => filter.id !== filterId);
    setFilters(updatedFilters);
    saveFiltersToStorage(updatedFilters);
  };

  const updateFilter = (filterId, updates) => {
    const updatedFilters = filters.map(filter => 
      filter.id === filterId ? { ...filter, ...updates } : filter
    );
    setFilters(updatedFilters);
    saveFiltersToStorage(updatedFilters);
  };

  const clearAllFilters = () => {
    setFilters([]);
    clearFiltersFromStorage();
  };

  // Apply filters to data
  useEffect(() => {
    if (!data?.attendees) {
      onFilteredDataChange([]);
      return;
    }

    let filtered = data.attendees.map(attendee => ({
      ...attendee,
      status: statusUpdates[attendee.id] || attendee.status,
      fullName: `${attendee.firstName || ''} ${attendee.lastName || ''}`,
      discountCode: attendee.order.discountCode ? attendee.order.discountCode.code : 'None',
      orderStatus: attendee.order.status === 'paid' && Number(attendee.order.totalAmount) === 0 ? 'free' : attendee.order.status,
      ticketType: attendee.ticket.ticketType.title || '',
      ticketAddOn: attendee.ticket.ticketAddOn?.addOn?.name || 'N/A',
      ticketCode: attendee.ticket.ticketCode || '',
      orderNumber: attendee.order.orderNumber || '',
      phoneNumber: attendee.phoneNumber || '',
      companyName: attendee.companyName || 'No company',
      ticketStatus: (() => {
        const originalTicketPrice = Number(attendee.ticket.ticketType.price) || 0;
        const orderStatus = attendee.order.status;
        const orderAmount = Number(attendee.order.totalAmount) || 0;
        const discountAmount = Number(attendee.order.discountAmount) || 0;
        const { discountCode } = attendee.order;
        
        if (originalTicketPrice === 0) return 'free';
        if (orderStatus !== 'paid') return orderStatus || 'pending';
        
        if (orderStatus === 'paid') {
          if (discountCode && discountAmount > 0) {
            if (orderAmount === 0) return 'free';
            if (discountAmount >= originalTicketPrice) return 'free';
            if (discountAmount > 0 && discountAmount < originalTicketPrice) return 'paid';
          }
          return 'paid';
        }
        
        return orderStatus || 'pending';
      })(),
      addOnStatus: (() => {
        const { ticketAddOn } = attendee.ticket;
        if (!ticketAddOn) return 'none';
        
        const addOnPrice = Number(ticketAddOn.price) || 0;
        const originalAddOnPrice = Number(ticketAddOn.addOn?.price) || 0;
        const orderStatus = attendee.order.status;
        const orderAmount = Number(attendee.order.totalAmount) || 0;
        const discountAmount = Number(attendee.order.discountAmount) || 0;
        
        if (originalAddOnPrice === 0) return 'free';
        if (addOnPrice === 0 && originalAddOnPrice > 0) return 'free';
        
        if (orderStatus === 'paid') {
          const originalTicketPrice = Number(attendee.ticket.ticketType.price) || 0;
          
          if (orderAmount === 0 && discountAmount > 0) {
            const totalWithoutDiscount = originalTicketPrice + originalAddOnPrice;
            if (discountAmount >= totalWithoutDiscount) return 'free';
            if (discountAmount >= originalTicketPrice && discountAmount < totalWithoutDiscount) return 'paid';
            if (discountAmount < originalTicketPrice) return 'paid';
          }
          
          if (orderAmount > 0 && originalAddOnPrice > 0) return 'paid';
          if (originalAddOnPrice === 0) return 'free';
        }
        
        return orderStatus || 'pending';
      })(),
    }));

    if (filters.length > 0) {
      filtered = filtered.filter(row => filters.every(filter => {
        if (!filter.value) return true;
        
        const fieldValue = String(row[filter.field] || '').toLowerCase();
        const filterValue = String(filter.value).toLowerCase();
        
        switch (filter.operator) {
          case 'contains':
            return fieldValue.includes(filterValue);
          case 'equals':
            return fieldValue === filterValue;
          case 'startsWith':
            return fieldValue.startsWith(filterValue);
          case 'endsWith':
            return fieldValue.endsWith(filterValue);
          default:
            return fieldValue.includes(filterValue);
        }
      }));
    }

    onFilteredDataChange(filtered);
  }, [data?.attendees, statusUpdates, filters, onFilteredDataChange]);

  // Render the inline filter section
  const renderFilterSection = () => (
    <Collapse in={isFilterExpanded}>
      <Box sx={{ 
        p: isMobile ? 1 : 1.5,
        borderBottom: `1px solid ${borderColor}`,
        bgcolor: getMobileBackgroundColor(),
      }}>
        {/* Filter Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 1.5,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 1 : 0,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ 
              color: textColor, 
              fontWeight: 600, 
              fontSize: isMobile ? '0.8125rem' : '0.875rem',
            }}>
              Advanced Filters
            </Typography>
            {filters.length > 0 && (
              <>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 500,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                }}>
                  ({data?.attendees ? filters.length : 0} active)
                </Typography>
                <Tooltip title="Filters are automatically saved and will persist until cleared">
                  <Iconify 
                    icon="eva:bookmark-fill" 
                    sx={{ 
                      width: isMobile ? 14 : 16, 
                      height: isMobile ? 14 : 16,
                      color: theme.palette.success.main,
                      opacity: 0.8,
                    }} 
                  />
                </Tooltip>
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1 }}>
            {isMobile ? (
              <>
                <IconButton
                  size="small"
                  onClick={addFilter}
                  sx={{
                    width: 28,
                    height: 28,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.08)',
                    },
                  }}
                >
                  <Iconify icon="eva:plus-fill" width={16} height={16} />
                </IconButton>
                {filters.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={clearAllFilters}
                    sx={{
                      width: 28,
                      height: 28,
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(211, 47, 47, 0.04)' : 'rgba(244, 67, 54, 0.08)',
                      },
                    }}
                  >
                    <Iconify icon="eva:trash-2-outline" width={16} height={16} />
                  </IconButton>
                )}
              </>
            ) : (
              <>
                <Button
                  size="small"
                  startIcon={<Iconify icon="eva:plus-fill" width={16} height={16} />}
                  onClick={addFilter}
                  sx={{
                    color: theme.palette.primary.main,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    minWidth: 'auto',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.08)',
                    },
                  }}
                >
                  Add Filter
                </Button>
                {filters.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<Iconify icon="eva:trash-2-outline" width={16} height={16} />}
                    onClick={clearAllFilters}
                    sx={{
                      color: theme.palette.error.main,
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(211, 47, 47, 0.04)' : 'rgba(244, 67, 54, 0.08)',
                      },
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Filter Rows */}
        {filters.length === 0 ? (
          <Typography variant="body2" sx={{ 
            color: secondaryTextColor, 
            fontStyle: 'italic',
            fontSize: isMobile ? '0.8rem' : '0.8125rem',
            textAlign: 'center',
            py: isMobile ? 2 : 1,
          }}>
            Click + to add filters
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1.5 : 1 }}>
            {filters.map((filter, index) => (
              <Box 
                key={filter.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: isMobile ? 'stretch' : 'center', 
                  gap: isMobile ? 1 : 1,
                                     flexDirection: isMobile ? 'column' : 'row',
                   p: isMobile ? 1 : 0,
                   bgcolor: isMobile ? getMobileBackgroundColor() : 'transparent',
                   borderRadius: isMobile ? 1 : 0,
                   border: isMobile ? `1px solid ${getMobileBorderColor()}` : 'none',
                }}
              >
                {/* AND Label - Desktop only */}
                {!isMobile && index > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: secondaryTextColor,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      minWidth: 28,
                      textAlign: 'center',
                    }}
                  >
                    AND
                  </Typography>
                )}
                {!isMobile && index === 0 && <Box sx={{ width: 28 }} />}
                
                {/* Mobile AND Label */}
                {isMobile && index > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: secondaryTextColor,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      textAlign: 'center',
                      alignSelf: 'center',
                      mb: -0.5,
                      mt: -1,
                    }}
                  >
                    AND
                  </Typography>
                )}

                                 {/* Filter Controls Container */}
                 <Box sx={{
                   display: 'flex',
                   flexDirection: isMobile ? 'column' : 'row',
                   gap: isMobile ? 1.5 : 1,
                   flex: 1,
                   alignItems: isMobile ? 'stretch' : 'center',
                 }}>
                   {/* Mobile: Field and Operator in same row */}
                   {isMobile ? (
                     <Box sx={{ display: 'flex', gap: 1 }}>
                       {/* Field Selection */}
                       <FormControl size="small" sx={{ flex: 2, minWidth: 120 }}>
                         <Select
                           value={filter.field}
                           onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: '' })}
                           sx={{
                             height: 44,
                             fontSize: '0.875rem',
                             '& .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                               borderWidth: '1.5px',
                             },
                             '&:hover .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                             },
                             '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.primary.main,
                               borderWidth: '2px',
                             },
                             '& .MuiSelect-select': {
                               py: 1.2,
                               color: textColor,
                               fontWeight: 500,
                             },
                             borderRadius: 2,
                           }}
                           MenuProps={{
                             PaperProps: {
                               sx: {
                                 maxHeight: 300,
                                 '& .MuiMenuItem-root': {
                                   py: 1.5,
                                   px: 2,
                                   fontSize: '0.875rem',
                                   minHeight: 'auto',
                                 },
                               },
                             },
                           }}
                         >
                           {filterOptions.map((option) => (
                             <MenuItem key={option.field} value={option.field}>
                               {option.label}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                       
                       {/* Operator Selection */}
                       <FormControl size="small" sx={{ flex: 1, minWidth: 80 }}>
                         <Select
                           value={filter.operator}
                           onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                           sx={{
                             height: 44,
                             fontSize: '0.875rem',
                             '& .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                               borderWidth: '1.5px',
                             },
                             '&:hover .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                             },
                             '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.primary.main,
                               borderWidth: '2px',
                             },
                             '& .MuiSelect-select': {
                               py: 1.2,
                               color: secondaryTextColor,
                               fontWeight: 500,
                             },
                             borderRadius: 2,
                           }}
                           MenuProps={{
                             PaperProps: {
                               sx: {
                                 '& .MuiMenuItem-root': {
                                   py: 1.5,
                                   px: 2,
                                   fontSize: '0.875rem',
                                   minHeight: 'auto',
                                 },
                               },
                             },
                           }}
                         >
                           <MenuItem value="contains">contains</MenuItem>
                           <MenuItem value="equals">equals</MenuItem>
                           <MenuItem value="startsWith">starts with</MenuItem>
                           <MenuItem value="endsWith">ends with</MenuItem>
                         </Select>
                       </FormControl>
                     </Box>
                   ) : (
                     <>
                       {/* Desktop: Field Selection */}
                       <FormControl size="small" sx={{ minWidth: 140 }}>
                         <Select
                           value={filter.field}
                           onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: '' })}
                           sx={{
                             height: 32,
                             fontSize: '0.8125rem',
                             '& .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                             },
                             '&:hover .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                             },
                             '& .MuiSelect-select': {
                               py: 0.5,
                               color: textColor,
                             },
                           }}
                         >
                           {filterOptions.map((option) => (
                             <MenuItem key={option.field} value={option.field} sx={{ fontSize: '0.8125rem' }}>
                               {option.label}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                       
                       {/* Desktop: Operator Selection */}
                       <FormControl size="small" sx={{ minWidth: 80 }}>
                         <Select
                           value={filter.operator}
                           onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                           sx={{
                             height: 32,
                             fontSize: '0.8125rem',
                             '& .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                             },
                             '&:hover .MuiOutlinedInput-notchedOutline': {
                               borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                             },
                             '& .MuiSelect-select': {
                               py: 0.5,
                               color: secondaryTextColor,
                             },
                           }}
                         >
                           <MenuItem value="contains" sx={{ fontSize: '0.8125rem' }}>contains</MenuItem>
                           <MenuItem value="equals" sx={{ fontSize: '0.8125rem' }}>equals</MenuItem>
                           <MenuItem value="startsWith" sx={{ fontSize: '0.8125rem' }}>starts with</MenuItem>
                           <MenuItem value="endsWith" sx={{ fontSize: '0.8125rem' }}>ends with</MenuItem>
                         </Select>
                       </FormControl>
                     </>
                   )}
                  
                                     {/* Value Input */}
                   <Box sx={{ 
                     flex: 1, 
                     minWidth: isMobile ? 'auto' : 120,
                     display: 'flex',
                     alignItems: 'center',
                     gap: 1,
                   }}>
                     {(() => {
                       const fieldOption = filterOptions.find(opt => opt.field === filter.field);
                       if (fieldOption?.type === 'select') {
                         return (
                           <FormControl fullWidth size="small">
                             <Select
                               value={filter.value}
                               onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                               displayEmpty
                               sx={{
                                 height: isMobile ? 44 : 32,
                                 fontSize: isMobile ? '0.875rem' : '0.8125rem',
                                 '& .MuiOutlinedInput-notchedOutline': {
                                   borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                                   borderWidth: isMobile ? '1.5px' : '1px',
                                 },
                                 '&:hover .MuiOutlinedInput-notchedOutline': {
                                   borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                                 },
                                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                   borderColor: theme.palette.primary.main,
                                   borderWidth: '2px',
                                 },
                                 '& .MuiSelect-select': {
                                   py: isMobile ? 1.2 : 0.5,
                                   color: textColor,
                                   fontWeight: isMobile ? 500 : 400,
                                 },
                                 borderRadius: isMobile ? 2 : 1,
                               }}
                               MenuProps={{
                                 PaperProps: {
                                   sx: {
                                     maxHeight: 300,
                                     '& .MuiMenuItem-root': {
                                       py: isMobile ? 1.5 : 1,
                                       px: 2,
                                       fontSize: isMobile ? '0.875rem' : '0.8125rem',
                                       minHeight: 'auto',
                                     },
                                   },
                                 },
                               }}
                             >
                               <MenuItem value="" sx={{ fontStyle: 'italic', color: secondaryTextColor }}>
                                 {isMobile ? 'Select...' : 'Select...'}
                               </MenuItem>
                               {fieldOption.options.map((option) => (
                                 <MenuItem key={option} value={option}>
                                   {option.charAt(0).toUpperCase() + option.slice(1)}
                                 </MenuItem>
                               ))}
                             </Select>
                           </FormControl>
                         );
                       }
                       return (
                         <TextField
                           fullWidth
                           size="small"
                           placeholder={isMobile ? 'Enter value...' : 'Enter value...'}
                           value={filter.value}
                           onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                           sx={{
                             '& .MuiOutlinedInput-root': {
                               height: isMobile ? 44 : 32,
                               fontSize: isMobile ? '0.875rem' : '0.8125rem',
                               borderRadius: isMobile ? 2 : 1,
                               '& fieldset': {
                                 borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                                 borderWidth: isMobile ? '1.5px' : '1px',
                               },
                               '&:hover fieldset': {
                                 borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                               },
                               '&.Mui-focused fieldset': {
                                 borderColor: theme.palette.primary.main,
                                 borderWidth: '2px',
                               },
                               '& input': {
                                 py: isMobile ? 1.2 : 0.5,
                                 color: textColor,
                                 fontWeight: isMobile ? 500 : 400,
                                 '&::placeholder': {
                                   color: secondaryTextColor,
                                   opacity: 0.7,
                                 },
                               },
                             },
                           }}
                         />
                       );
                     })()}
                     
                     {/* Remove Filter Button */}
                     <IconButton
                       size="small"
                       onClick={() => removeFilter(filter.id)}
                       sx={{
                         width: isMobile ? 36 : 28,
                         height: isMobile ? 36 : 28,
                         color: theme.palette.error.main,
                         opacity: 0.7,
                         flexShrink: 0,
                         borderRadius: isMobile ? 2 : 1,
                         border: isMobile ? `1px solid ${theme.palette.error.main}20` : 'none',
                         '&:hover': {
                           opacity: 1,
                           bgcolor: theme.palette.mode === 'light' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(244, 67, 54, 0.12)',
                           borderColor: isMobile ? `${theme.palette.error.main}40` : 'transparent',
                         },
                       }}
                     >
                       <Iconify icon="eva:close-fill" width={isMobile ? 18 : 16} height={isMobile ? 18 : 16} />
                     </IconButton>
                   </Box>
                </Box>
              </Box>
            ))}
            
            {/* Active Filter Summary */}
            {filters.filter(f => f.value).length > 0 && (
              <Box sx={{ 
                mt: 1, 
                pt: 1, 
                borderTop: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}`,
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.5,
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}>
                <Typography variant="caption" sx={{ 
                  color: secondaryTextColor, 
                  fontWeight: 500, 
                  mr: 1,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  width: isMobile ? '100%' : 'auto',
                  textAlign: isMobile ? 'center' : 'left',
                  mb: isMobile ? 0.5 : 0,
                }}>
                  Active Filters:
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  width: isMobile ? '100%' : 'auto',
                }}>
                  {filters.filter(f => f.value).map((filter) => {
                    const fieldOption = filterOptions.find(opt => opt.field === filter.field);
                    return (
                      <Chip
                        key={filter.id}
                        label={`${fieldOption?.label}: "${filter.value}"`}
                        size="small"
                        onDelete={() => removeFilter(filter.id)}
                        sx={{
                          height: isMobile ? 24 : 20,
                          fontSize: isMobile ? '0.75rem' : '0.7rem',
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          maxWidth: isMobile ? '280px' : 'none',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: isMobile ? '200px' : 'none',
                          },
                          '& .MuiChip-deleteIcon': {
                            fontSize: isMobile ? '1rem' : '0.75rem',
                            color: theme.palette.primary.contrastText,
                            '&:hover': {
                              color: theme.palette.primary.contrastText,
                            },
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Collapse>
  );

  return {
    CustomToolbar: (props) => (
      <CustomToolbar 
        {...props}
        isFilterExpanded={isFilterExpanded}
        setIsFilterExpanded={setIsFilterExpanded}
        filters={filters}
        theme={theme}
        textColor={textColor}
      />
    ),
    FilterSection: renderFilterSection,
    filters,
  };
};

EventFilters.propTypes = {
  data: PropTypes.object,
  statusUpdates: PropTypes.object,
  onFilteredDataChange: PropTypes.func.isRequired,
  isFilterExpanded: PropTypes.bool.isRequired,
  setIsFilterExpanded: PropTypes.func.isRequired,
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default EventFilters; 