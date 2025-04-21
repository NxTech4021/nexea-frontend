import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import OrderDetails from 'src/sections/events/orders/view/order-details';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title> Order Details </title>
      </Helmet>

      <OrderDetails orderId={id} />
    </>
  );
}
