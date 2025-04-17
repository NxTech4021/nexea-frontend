import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import { Box, alpha, styled, TextField, Typography } from '@mui/material';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    '& fieldset': {
      borderColor: alpha(theme.palette.text.primary, 0.2),
      transition: 'border-color 0.2s ease-in-out',
    },
    borderRadius: 8,
    fontSize: '0.9rem',
    '&:hover': {
      '& fieldset': {
        borderColor: alpha(theme.palette.grey[600], 0.5),
      },
    },
    '&.Mui-focused': {
      '& fieldset': {
        borderColor: theme.palette.grey[700],
        borderWidth: '1.5px',
      },
    },
  },

  '& .MuiOutlinedInput-input': {
    padding: '12px 14px',
  },

  '& .MuiFormHelperText-root': {
    marginLeft: 2,
    marginTop: 4,
    fontSize: '0.75rem',
  },
}));

export const TextFieldCustom = ({ name, type, helperText, label, ...other }) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box sx={{ width: '100%' }}>
          {label && (
            <Typography 
              variant="body2" 
              component="label" 
              htmlFor={name} 
              sx={{ 
                mb: 0.75, 
                display: 'block', 
                fontSize: '0.85rem',
                fontWeight: 500,
                color: error ? 'error.main' : 'text.secondary',
              }}
            >
              {label}
            </Typography>
          )}
          <CustomTextField
            {...field}
            aria-readonly
            fullWidth
            type={type}
            id={name}
            value={type === 'number' && field.value === 0 ? '' : field.value}
            onChange={(event) => {
              if (type === 'number') {
                field.onChange(Number(event.target.value));
              } else {
                field.onChange(event.target.value);
              }
            }}
            error={!!error}
            helperText={error ? error?.message : helperText}
            placeholder={other?.placeholder || label}
            InputLabelProps={{ shrink: true }}
            {...other}
            label=""
          />
        </Box>
      )}
    />
  );
};

TextFieldCustom.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
};
