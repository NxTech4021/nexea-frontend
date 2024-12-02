import { Helmet } from 'react-helmet-async';

import DiscountCodeView from 'src/sections/events/discount-codes/view/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Discount Codes</title>
      </Helmet>

      <DiscountCodeView />
    </>
  );
}
