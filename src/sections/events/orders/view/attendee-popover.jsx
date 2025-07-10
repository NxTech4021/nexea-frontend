import { useState } from 'react';
import PropTypes from 'prop-types';

import { useTheme } from '@mui/material/styles';
import {
  Box,
  Popover,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';

const AttendeePopover = ({ attendees, searchQuery }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  if (!attendees || attendees.length === 0) return null;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Box
          key={index}
          component="span"
          sx={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            fontWeight: 600,
            px: 0.25,
            borderRadius: 0.5,
          }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  // Check if any attendee matches the search
  const hasMatch = searchQuery && attendees.some(attendee => {
    const fullName = `${attendee.firstName} ${attendee.lastName}`.toLowerCase();
    const email = attendee.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          ml: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          cursor: 'pointer',
          color: hasMatch ? theme.palette.success.main : theme.palette.text.secondary,
          backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#2d2d2d',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.2s ease',
          minWidth: 'auto',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.text.secondary,
            boxShadow: theme.customShadows?.z4 || '0 4px 8px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Iconify icon="eva:people-outline" width={14} height={14} />
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            fontWeight: hasMatch ? 600 : 500,
            lineHeight: 1,
          }}
        >
          {attendees.length}
        </Typography>
        <Iconify 
          icon="eva:chevron-down-outline" 
          width={12} 
          height={12} 
          sx={{ 
            opacity: 0.7,
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }} 
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 0.5,
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            minWidth: 280,
            maxWidth: 420,
            overflow: 'hidden',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: -6,
              left: 16,
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `6px solid ${theme.palette.background.paper}`,
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, maxWidth: 400 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#000', mb: 1 }}>
            Attendees ({attendees.length})
          </Typography>
          
          <Box sx={{ maxHeight: 160, overflowY: 'auto' }}>
            {attendees.map((attendee, index) => {
              const fullName = `${attendee.firstName} ${attendee.lastName}`;
              const isNameMatch = searchQuery && fullName.toLowerCase().includes(searchQuery.toLowerCase());
              const isEmailMatch = searchQuery && attendee.email?.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <Box
                  key={attendee.id || index}
                  sx={{
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 0.5,
                      mx: -0.5,
                      px: 0.5,
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, flexShrink: 0 }}>
                    {isNameMatch ? highlightText(fullName, searchQuery) : fullName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ({isEmailMatch ? highlightText(attendee.email, searchQuery) : attendee.email})
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

AttendeePopover.propTypes = {
  attendees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
    })
  ),
  searchQuery: PropTypes.string,
};

export default AttendeePopover; 