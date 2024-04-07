import React, { useState, useCallback, useEffect } from 'react';
import axios, { endpoints } from 'src/utils/axios';
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import bcrypt from 'bcryptjs'
import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

const AccountSecurity = () => {
  // const password = useBoolean();
  const [password, setPassword] = useState(
    {current: '', new: '', confirm: ''});
  const { user } = useAuthContext()
  const [error, setError] = useState('');

  const handleInputChanges = (event) => {
    setPassword({ ...password, [event.target.name]: event.target.value});
  };

  const handleSaveChanges = async () => {
    const { current, new: newPassword, confirm } = password;

    if (newPassword !== confirm) {
      setError ('Password do not match');
      return;
    }

    bcrypt.compare(current, user?.password, async function(err, result) {
      if (err) {
          console.error('Error comparing passwords:', err);
          return;
      }
  
      if (result) {
          if (current === user?.password){
            setError('New password must be different from the current password');
            return;
          } else {
            try {
              await axios.patch(endpoints.auth.update, { id: user?.id, password: confirm });
              alert('Password update successfully');
          } catch (error) {
              setError('Invalid current password');
          }
          }
      } else {
          setError('Invalid current password');
      }
  });
   
  };

  return (
    <Card sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <TextField
            type="password"
            name="current"
            label="Current password"
            fullWidth
            value={password.current}
            onChange={handleInputChanges}
          />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <TextField
            type="password"
            name="new"
            label="New password"
            fullWidth
            value={password.new}
            onChange={handleInputChanges}
          />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <TextField
            type="password"
            name="confirm"
            label="Confirm new password"
            fullWidth
            value={password.confirm}
            onChange={handleInputChanges}
            error={error !== ''}
            helperText={error}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: 'end' }}>
          <LoadingButton type="submit" variant="contained" onClick={handleSaveChanges}>
            Save Changes
          </LoadingButton>
        </Grid>
      </Grid>
    </Card>
  );
};

export default AccountSecurity;
