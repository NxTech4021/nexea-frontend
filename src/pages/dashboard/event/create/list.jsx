import { Helmet } from 'react-helmet-async';

import Events from 'src/sections/events/create/view/view';

// import Events from 'src/sections/events/create/view/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> NEXEA Events</title>
      </Helmet>

      <Events />
    </>
  );
}
