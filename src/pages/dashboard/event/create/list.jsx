import { Helmet } from 'react-helmet-async';

import Events from 'src/sections/events/create/view/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Events</title>
      </Helmet>

      <Events />
    </>
  );
}
