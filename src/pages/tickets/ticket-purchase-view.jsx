import React from 'react';
import { Helmet } from 'react-helmet-async';

import TicketPurchaseView from 'src/sections/tickets/view/view';

const Page = () => (
  <>
    <Helmet>
      <title>Ticket Purchase</title>
    </Helmet>

    <TicketPurchaseView />
  </>
);

export default Page;
