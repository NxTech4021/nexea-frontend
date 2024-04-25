import { Helmet } from 'react-helmet-async';

import ClassicVerifyView from 'src/sections/auth/verify-view';

// ----------------------------------------------------------------------

export default function ClassicVerifyPage() {
  return (
    <>
      <Helmet>
        <title> Auth Classic: Verify</title>
      </Helmet>

      <ClassicVerifyView />
    </>
  );
}
