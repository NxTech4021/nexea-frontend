import { Helmet } from 'react-helmet-async';

import DiscountCodeView from 'src/sections/events/discount-codes/view/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Discount Codes</title>
      </Helmet>

      <DiscountCodeView />
    </>
  );
}
