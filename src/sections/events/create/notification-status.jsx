/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';

import { Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import useGetAttendees from 'src/hooks/use-get-attendees';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import NotificationListItem from './notification-list-item';

const NotificationStatus = ({ id }) => {
  const { attendees } = useGetAttendees(id);

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Notification Status"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Event',
            href: paths.dashboard.employee,
          },
          { name: 'Notification' },
          {
            name: id,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {attendees && attendees.length < 1 ? (
        <Typography>No attendees</Typography>
      ) : (
        <NotificationListItem attendees={attendees} />
      )}
    </Container>
  );
};

export default NotificationStatus;

NotificationStatus.propTypes = {
  id: PropTypes.string,
};
