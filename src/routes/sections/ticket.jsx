import { lazy } from 'react';

const TicketPurchaseView = lazy(() => import('src/sections/tickets/view/view'));

export const ticketRoutes = [
  {
    path: 'ticket-checkout',
    element: <TicketPurchaseView />,
  },
];
