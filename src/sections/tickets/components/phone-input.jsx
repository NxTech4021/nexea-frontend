import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { Controller, useFormContext } from 'react-hook-form';

import { Box, alpha, useTheme, Typography } from '@mui/material';

// Custom styles for PhoneInput
const phoneInputStyles = `
  .phone-input-wrapper {
    width: 100%;
  }
  
  .phone-input-wrapper .PhoneInputCountry {
    margin-right: 10px;
    padding-left: 14px;
  }
  
  .phone-input-wrapper .PhoneInputCountryIcon {
    width: 24px;
    height: 18px;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .phone-input-wrapper .PhoneInputInput {
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s ease-in-out;
    width: 100%;
    height: 44px;
  }
  
  .phone-input-wrapper .PhoneInputInput:hover {
    border-color: rgba(97, 97, 97, 0.5);
  }
  
  .phone-input-wrapper .PhoneInputInput:focus {
    border-color: rgba(33, 33, 33, 0.87);
    border-width: 1.5px;
    box-shadow: none;
  }
  
  .phone-input-wrapper .PhoneInputInput:disabled,
  .phone-input-wrapper .PhoneInputInput[readonly] {
    background-color: rgba(0, 0, 0, 0.04);
    opacity: 0.7;
  }
`;

export const PhoneInputCustom = ({ name, label, readOnly, disabled, ...other }) => {
  const { control, watch } = useFormContext();
  const theme = useTheme();

  // Add style element for custom PhoneInput styles
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = phoneInputStyles;
    document.head.appendChild(styleElement);
    
    // Clean up when component unmounts
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

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
          <PhoneInput
            {...field}
            id={name}
            placeholder="Enter phone number"
            value={field.value}
            onChange={(value) => field.onChange(value || '')}
            international
            defaultCountry="MY"
            className="phone-input-wrapper"
            inputStyle={{
              border: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
              backgroundColor: 'transparent',
              color: theme.palette.text.primary,
            }}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            {...other}
          />
          {error && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'error.main',
                marginLeft: 2,
                marginTop: 0.5,
                display: 'block',
                fontSize: '0.75rem'
              }}
            >
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
};

PhoneInputCustom.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
}; 