import { Helmet } from 'react-helmet-async';

import Attendees from 'src/sections/three/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Attendees</title>
      </Helmet>

      <Attendees />
    </>
  );
}
