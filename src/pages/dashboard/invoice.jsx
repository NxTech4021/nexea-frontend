import { Helmet } from 'react-helmet-async';

import Invoices from 'src/sections/invoices/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Invoices</title>
      </Helmet>

      <Invoices />
    </>
  );
}
