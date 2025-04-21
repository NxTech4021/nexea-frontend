import { Helmet } from 'react-helmet-async';

import OrderView from 'src/sections/events/orders/view/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Orders </title>
      </Helmet>

      <OrderView />
    </>
  );
}
