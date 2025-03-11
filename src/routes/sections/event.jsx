import { lazy } from 'react';

const TicketPurchaseView = lazy(() => import('src/pages/tickets/ticket-purchase-view'));

export const eventRoutes = [
  {
    path: 'event/:event',
    element: <TicketPurchaseView />,
  },
];

// User view event
// /event/:eventId

// User in cart page
// /checkout/
