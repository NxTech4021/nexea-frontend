import { Helmet } from 'react-helmet-async';

import LinearStepper from 'src/sections/events/create/event-stepper';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new event</title>
      </Helmet>

      <LinearStepper />
    </>
  );
}
