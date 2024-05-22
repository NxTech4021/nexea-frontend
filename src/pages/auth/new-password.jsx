import { Helmet } from 'react-helmet-async';

import NewPasswordView from 'src/sections/auth/new-password';

// ----------------------------------------------------------------------

export default function NewPasswordPage() {
  return (
    <>
      <Helmet>
        <title>New Password</title>
      </Helmet>

      <NewPasswordView />
    </>
  );
}
