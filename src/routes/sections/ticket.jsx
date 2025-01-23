import { lazy } from 'react';

const TicketPurchaseView = lazy(() => import('src/pages/tickets/ticket-purchase-view'));

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
