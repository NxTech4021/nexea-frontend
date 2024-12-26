export const TICKET_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const _TicketTypes = [
  {
    id: 1,
    // title: 'Early Bird - Startup ',
    type: 'Early Bird',
    category: 'Startup',
    eventName: 'Entrepreneur Summit V',
    price: 150.0,
    status: 'active',
  },
  {
    id: 2,
    // title: 'Early Bird - General',
    type: 'Early Bird',
    category: 'General',
    eventName: 'Entrepreneur Summit V',
    price: 75.0,
    status: 'inactive',
  },
  {
    id: 3,
    // title: 'Early Bird - Speaker',
    type: 'Early Bird',
    category: 'Speaker',
    eventName: 'Entrepreneur Summit V',
    price: 100.0,
    status: 'active',
  },
  {
    id: 4,
    // title: 'Early Bird - VIP',
    type: 'Early Bird',
    category: 'VIP',
    eventName: 'Entrepreneur Summit V',
    price: 50.0,
    status: 'inactive',
  },
  {
    id: 5,
    // title: 'Standard - Startup',
    type: 'Standard',
    category: 'Startup',
    eventName: 'Entrepreneur Summit V',
    price: 300.0,
    status: 'active',
  },
  {
    id: 6,
    // title: 'Standard - General',
    type: 'Standard',
    category: 'General',
    eventName: 'Entrepreneur Summit V',
    price: 120.0,
    status: 'inactive',
  },
  {
    id: 7,
    // title: 'Standard - Speaker',
    type: 'Standard',
    category: 'Speaker',
    eventName: 'Entrepreneur Summit V',
    price: 100.0,
    quantity: 0,
    status: 'active',
  },
  {
    id: 8,
    // title: 'Standard - VIP',
    type: 'Standard',
    category: 'VIP',
    eventName: 'Entrepreneur Summit V',
    price: 100.0,
    quantity: 0,
    status: 'inactive',
  },
];

export const fetchMockTicketTypes = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(_TicketTypes);
    }, 500);
  });
