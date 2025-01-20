import { lazy } from 'react';

const TicketPurchaseView = lazy(() => import('src/sections/tickets/view/view'));

export const ticketRoutes = [
  {
    path: 'cart',
    element: <TicketPurchaseView />,
  },
  // {
  //   path: 'ticket-check/:eventId/:ticketId',
  //   element: <CheckSession />,
  // },
];
