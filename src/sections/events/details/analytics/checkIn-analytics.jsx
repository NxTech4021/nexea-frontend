import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import { Card, Typography, CardContent, Box, Stack } from '@mui/material';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

const CheckInAnalytics = ({ checkedIns, id }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${paths.dashboard.events.attendees}/${id}`);
  };

  return (
    <Card
      sx={{ border: 1, borderColor: (theme) => theme.palette.divider, borderRadius: 2, width: 1,
        '&:hover': {
          cursor: 'pointer',
          border: '2px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
          '& .hover-text': {
            textDecoration: 'underline',
            color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
          },
          '& .hover-icon': {
            color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
          }
        }}}
      onClick={handleClick}
    >
      {/* <CardHeader
        title="Total Checked In"
        titleTypographyProps={{
          variant: 'subtitle2',
          color: 'text.secondary',
        }}
        sx={{ py: 1.5 }}
      /> */}

      <CardContent sx={{ position: 'relative' }}>
        <Iconify
          icon="iconamoon:check-circle-1-thin"
          width={100}
          sx={{
            position: 'absolute',
            right: -30,
            color: '#EBEBEB',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />

        <Box sx={{ cursor: 'pointer' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography 
              className="hover-text"
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ fontWeight: 600 }}
            >
              Total Checked In
            </Typography>
            <Iconify 
              className="hover-icon" 
              icon="eva:arrow-ios-forward-fill"
            />
          </Stack>
          <Typography variant="h2">{checkedIns?.length || 0}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CheckInAnalytics;

CheckInAnalytics.propTypes = {
  checkedIns: PropTypes.array,
  id: PropTypes.string.isRequired,
};
