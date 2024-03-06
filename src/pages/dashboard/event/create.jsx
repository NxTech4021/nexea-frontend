import { Helmet } from 'react-helmet-async';

import CreateEvent from 'src/sections/events/event-create';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new event</title>
      </Helmet>

      <CreateEvent />
    </>
  );
}
