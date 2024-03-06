import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const Event = lazy(() => import('src/pages/dashboard/event/list'));
const CreateEvent = lazy(() => import('src/pages/dashboard/event/create'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/four'));
const TestView = lazy(() => import('src/pages/dashboard/test'));

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
        path: 'events',
        children: [
          { element: <Event />, index: true },
          { path: 'create', element: <CreateEvent /> },
        ],
      },
      { path: 'attendees', element: <PageThree /> },
      { path: 'test', element: <TestView /> },
      { path: 'employee', element: <PageFour /> },
    ],
  },
];
