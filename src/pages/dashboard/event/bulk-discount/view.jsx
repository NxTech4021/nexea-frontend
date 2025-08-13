import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import BulkDiscountPage from 'src/sections/events/bulk-discount/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title> Bulk Discount </title>
      </Helmet>

      <BulkDiscountPage />
    </>
  );
}
