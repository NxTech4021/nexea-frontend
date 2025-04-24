import { Helmet } from 'react-helmet-async';

import AddOnView from 'src/sections/events/ticket-types/add-on/view/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Ticket Add Ons</title>
      </Helmet>

      <AddOnView />
    </>
  );
}
