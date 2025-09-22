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
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/event/order-details/view'));
const TicketTypeView = lazy(() => import('src/pages/dashboard/event/ticket-types/view'));
const TicketTypesPage = lazy(() => import('src/pages/dashboard/event/settings/view'));

const AddOnView = lazy(() => import('src/pages/dashboard/event/ticket-types/add-on/view'));

const EventDetail = lazy(() => import('src/pages/dashboard/event/details/view'));

const InvoicesPage = lazy(() => import('src/pages/dashboard/invoice'));

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
          { path: ':id', element: <EventDetail /> },
          { path: 'create', element: <CreateEvent /> },
          {
            path: 'qr/:eventId',
            element: <QrReader />,
          },
          { path: 'attendees/:id', element: <EventAttendee /> },
          { path: 'notifcationStatus/:id', element: <NotificationStatus /> },
        ],
      },
      {
        path: 'ticket-type',
        children: [
          { element: <TicketTypeView />, index: true },
          { path: 'list', element: <TicketTypeView /> },
          { path: 'settings', element: <TicketTypesPage /> },
          // { path: 'addOn', element: <AddOnView /> },
        ],
      },
      {
        path: 'add-on',
        children: [
          { element: <AddOnView />, index: true },
          { path: 'addOn', element: <AddOnView /> },
        ],
      },
      { path: 'discount-code', element: <DiscountCodeView /> },
      { path: 'order', element: <OrderView /> },
      { path: 'order/event/:eventId', element: <OrderView /> },
      { path: 'order/:id', element: <OrderDetailsPage /> },
      {
        path: 'templates',
        children: [{ element: <WhatsappTemplate />, index: true }],
      },
      { path: 'attendees', element: <PageThree /> },
      { path: 'employee', element: <PageFour /> },
      { path: 'qr', element: <QrReader /> },
      { path: 'invoices', element: <InvoicesPage /> },
    ],
  },
];
