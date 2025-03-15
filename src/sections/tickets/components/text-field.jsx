import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import { styled, TextField } from '@mui/material';

const CustomTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    '& fieldset': {
      borderColor: '#DFDFDF', // Change the border color here
    },
    borderRadius: 4,
  },

  '& .MuiInputLabel-root': {
    color: '#707070',
  },
});

export const TextFieldCustom = ({ name, type, helperText, ...other }) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <CustomTextField
          {...field}
          aria-readonly
          fullWidth
          type={type}
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
          placeholder={other?.placeholder}
          {...other}
        />
      )}
    />
  );
};

TextFieldCustom.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
};
