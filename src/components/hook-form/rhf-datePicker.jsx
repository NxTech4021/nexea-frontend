import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import { Stack, InputLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function RHFDatePicker({
  name,
  helperText,
  type,
  label,
  disabled,
  minDate,
  maxDate,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Stack width={1} spacing={1}>
      <InputLabel required={other?.required}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* <DemoContainer components={['DatePicker']}> */}
            <DatePicker
              // label={label}
              disabled={disabled}
              format="DD/MM/YYYY"
              {...field}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error,
                  helperText: error?.message,
                },
              }}
              minDate={minDate}
              maxDate={maxDate}
              // {...other}
            />
            {/* </DemoContainer> */}
          </LocalizationProvider>
        )}
      />
    </Stack>
  );
}

RHFDatePicker.propTypes = {
  name: PropTypes.string,
  helperText: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
};
