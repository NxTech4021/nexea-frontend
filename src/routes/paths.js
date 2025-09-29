// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  EVENT: '/event',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      verify: `${ROOTS.AUTH}/jwt/verify`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`,
      newPassword: `${ROOTS.AUTH}/jwt/new-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
    },
    events: {
      root: `${ROOTS.DASHBOARD}/events`,
      create: `${ROOTS.DASHBOARD}/events/create`,
      discountCode: `${ROOTS.DASHBOARD}/events/discount-code`,
      order: `${ROOTS.DASHBOARD}/events/order`,
      qr: `${ROOTS.DASHBOARD}/events/qr`,
      attendees: `${ROOTS.DASHBOARD}/events/attendees`,
      notification: (id) => `${ROOTS.DASHBOARD}/events/notifcationStatus/${id}`,
      details: (id) => `${ROOTS.DASHBOARD}/events/${id}`,
    },
    ticketType: {
      root: `${ROOTS.DASHBOARD}/ticket-type`,
      settings: `${ROOTS.DASHBOARD}/ticket-type/settings`,
    },
    addOn: {
      root: `${ROOTS.DASHBOARD}/add-on`,
    },
    discountCode: {
      root: `${ROOTS.DASHBOARD}/discount-code`,
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      event: (eventId) => `${ROOTS.DASHBOARD}/order/event/${eventId}`,
    },
    whatsappTemplate: {
      root: `${ROOTS.DASHBOARD}/templates`,
    },
    tickets: {
      root: (id) => `${ROOTS.EVENT}/${id}`,
    },
    attendees: `${ROOTS.DASHBOARD}/attendees`,
    test: `${ROOTS.DASHBOARD}/test`,
    employee: `${ROOTS.DASHBOARD}/employee`,
    Qr: `${ROOTS.DASHBOARD}/qr`,
    invoices: {
      root: `${ROOTS.DASHBOARD}/invoices`,
    },
  },
};
