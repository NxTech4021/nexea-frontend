import { Helmet } from 'react-helmet-async';

import TicketTypeView from 'src/sections/events/ticket-types/view/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Discount Codes</title>
      </Helmet>

      <TicketTypeView />
    </>
  );
}
