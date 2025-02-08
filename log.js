const attendees = [
  {
    email: '',
    name: '',
    ticketTypeId: 2,
  },
  {
    email: '',
    name: '',
    ticketTypeId: 1,
  },
  {
    email: '',
    name: '',
    ticketTypeId: 2,
  },
];

const handleTicketHolder = () => {
  const groupedAttendees = attendees.reduce((acc, { ticketTypeId }) => {
    acc[ticketTypeId] = (acc[ticketTypeId] || 0) + 1;
    return acc;
  }, {});

  console.log(groupedAttendees);
};

handleTicketHolder('2');
