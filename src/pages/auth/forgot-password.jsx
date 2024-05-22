import { Helmet } from 'react-helmet-async';

import ForgotPassword from 'src/sections/auth/forgot-password';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Forgot Password</title>
      </Helmet>

      <ForgotPassword />
    </>
  );
}
