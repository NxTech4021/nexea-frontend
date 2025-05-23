import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import EventDetails from 'src/sections/events/details/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title> Event Details </title>
      </Helmet>

      <EventDetails id={id} />
    </>
  );
}
