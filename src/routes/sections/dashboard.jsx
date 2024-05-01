import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import Profile from 'src/sections/profile/view';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const Event = lazy(() => import('src/pages/dashboard/event/list'));
const CreateEvent = lazy(() => import('src/pages/dashboard/event/create'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/employee/four'));
const TestView = lazy(() => import('src/pages/dashboard/test'));
const QrReader = lazy(() => import('src/components/qrscanner/QrReader'));

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
      { element: <IndexPage />, index: true },
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
          {
            path: 'qr/:eventId',
            element: <QrReader />,
          },
        ],
      },
      { path: 'attendees', element: <PageThree /> },
      { path: 'test', element: <TestView /> },
      { path: 'employee', element: <PageFour /> },
      { path: 'qr', element: <QrReader /> },
    ],
  },
];
