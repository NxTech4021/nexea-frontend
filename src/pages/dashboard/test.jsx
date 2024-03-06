import React from 'react';
import { Helmet } from 'react-helmet-async';

import { RoleBasedGuard } from 'src/auth/guard';

import TestView from 'src/sections/test/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Tests</title>
      </Helmet>
      <RoleBasedGuard hasContent roles={['notadmin']}>
        <TestView />
      </RoleBasedGuard>
    </>
  );
}
