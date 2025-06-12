import * as Yup from 'yup';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Card } from '@mui/material';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.email, data.password);

      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
      // setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
      <Logo sx={{ width: 64, height: 64 }} />
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="email" placeholder="Email address" outerLabel="Email" />

      <RHFTextField
        name="password"
        outerLabel="Password"
        placeholder="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'eva:eye-outline' : 'eva:eye-off-outline'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link
        variant="subtitle2"
        component={RouterLink}
        color="inherit"
        // underline="always"
        sx={{ alignSelf: 'flex-start', color: '#111' }}
        href={paths.auth.jwt.forgotPassword}
      >
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{
          bgcolor: '#111',
          color: 'white',
          '&:hover': {
            bgcolor: '#333',
          },
        }}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        {renderHead}

        {renderForm}
        <Stack direction="row" spacing={0.5} mt={1}>
          <Typography variant="subtitle2" fontWeight={400}>
            New user ?
          </Typography>

          <Link
            component={RouterLink}
            href={paths.auth.jwt.register}
            variant="subtitle2"
            sx={{ color: '#111' }}
          >
            Create an account
          </Link>
        </Stack>
      </Card>
    </FormProvider>
  );
}
