import React from 'react';
import PropTypes from 'prop-types';

import { Box, Button, Typography, ListItemText } from '@mui/material';

const AddOnItem = ({ title, description, price, id }) => {
  console.log('dasd');
  return (
    <Box
      key={id}
      sx={{
        border: 0.5,
        minWidth: 180,
        borderRadius: 0.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderColor: 'text.secondary',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <ListItemText
          primary={title}
          secondary={description}
          slotProps={{
            primary: {
              variant: 'subtitle2',
            },
            secondary: {
              variant: 'caption',
              color: 'text.secondary',
            },
          }}
        />

        <Typography variant="subtitle2" alignSelf="flex-end">
          {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(price || 0)}
        </Typography>
      </Box>
      <Button variant="contained" sx={{ borderRadius: 0.5, mx: 1, mb: 1 }}>
        Add
      </Button>
    </Box>
  );
};

export default AddOnItem;

AddOnItem.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  price: PropTypes.string,
  id: PropTypes.string,
};
