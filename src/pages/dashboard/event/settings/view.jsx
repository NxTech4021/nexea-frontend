import { Helmet } from 'react-helmet-async';

import TicketTypesPage from 'src/sections/events/ticket-types/settings';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Settings</title>
      </Helmet>

      <TicketTypesPage />
    </>
  );
}
