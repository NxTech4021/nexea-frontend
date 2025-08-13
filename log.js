const tickets = [
  { id: 1, name: 'Ticket A', price: 10 },
  { id: 2, name: 'Ticket B', price: 20 },
  { id: 3, name: 'Ticket C', price: 20 },
];

const cartItems = {
  id: 1,
  tickets: tickets
    // .filter((a) => a.id !== 3)
    .map((elem) => ({ ...elem, quantity: elem.id === 1 ? 2 : 3 })),
};

const bulkDiscount = {
  applicableTicket: tickets.filter((a) => a.id !== 3),
  minQuantity: 2,
  discountAmount: 20,
};

const getTotalPrice = () =>
  cartItems.tickets.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

const checkBulkDiscount = () => {
  const applicableTickets = bulkDiscount.applicableTicket.map((i) => i.id);

  const filteredTickets = cartItems.tickets.filter((ticket) =>
    applicableTickets.includes(ticket.id)
  );

  if (filteredTickets.reduce((acc, curr) => acc + curr.quantity, 0) >= bulkDiscount.minQuantity) {
    console.log('Applied');
  } else {
    console.log(`Not Applicable. because less than ${bulkDiscount.minQuantity}`);
  }
};

checkBulkDiscount();
