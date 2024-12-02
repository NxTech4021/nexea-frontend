import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import Profile from 'src/sections/profile/view';
import EventAttendee from 'src/sections/events/create/event-attendee';

// ----------------------------------------------------------------------

const Dashboard = lazy(() => import('src/pages/dashboard/view'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/employee/four'));
const QrReader = lazy(() => import('src/components/qrscanner/QrReader'));

const WhatsappTemplate = lazy(() => import('src/pages/dashboard/whatsappTemplate/index'));

// Event
const Event = lazy(() => import('src/pages/dashboard/event/create/list'));
const CreateEvent = lazy(() => import('src/pages/dashboard/event/create/create'));
const NotificationStatus = lazy(() => import('src/pages/dashboard/event/notifications-status'));
const DiscountCodeView = lazy(() => import('src/pages/dashboard/event/discount-code/view'));
const OrderView = lazy(() => import('src/pages/dashboard/event/orders/view'));
const TicketTypeView = lazy(() => import('src/pages/dashboard/event/ticket-types/view'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <Dashboard />, index: true },
      {
        path: 'user',
        children: [
          { element: <Profile />, index: true },
          { path: 'profile', element: <Profile /> },
        ],
      },
      {
        path: 'events',
        children: [
          { element: <Event />, index: true },
          { path: 'create', element: <CreateEvent /> },
          { path: 'discount-code', element: <DiscountCodeView /> },
          { path: 'ticket-type', element: <TicketTypeView /> },
          { path: 'order', element: <OrderView /> },
          {
            path: 'qr/:eventId',
            element: <QrReader />,
          },
          { path: 'attendees/:id', element: <EventAttendee /> },
          { path: 'notifcationStatus/:id', element: <NotificationStatus /> },
        ],
      },
      {
        path: 'templates',
        children: [{ element: <WhatsappTemplate />, index: true }],
      },
      { path: 'attendees', element: <PageThree /> },
      { path: 'employee', element: <PageFour /> },
      { path: 'qr', element: <QrReader /> },
    ],
  },
];
