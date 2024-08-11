import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import NotificationStatus from 'src/sections/events/notification-status';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();
  return (
    <>
      <Helmet>
        <title> Event: Notification Status</title>
      </Helmet>

      <NotificationStatus id={id} />
    </>
  );
}
