import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { PATH_AFTER_LOGIN } from 'src/config-global';

import { mainRoutes } from './main';
import { authRoutes } from './auth';
import { ticketRoutes } from './cart';
import { eventRoutes } from './event';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const SuccessView = lazy(() => import('src/pages/tickets/success-view'));

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    },

    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    ...ticketRoutes,

    ...eventRoutes,

    { path: '/success', element: <SuccessView /> },

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
