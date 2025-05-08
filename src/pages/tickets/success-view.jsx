import { Helmet } from 'react-helmet-async';

import SuccessPayment from 'src/sections/tickets/view/success';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Order Success</title>
      </Helmet>

      <SuccessPayment />
    </>
  );
}
