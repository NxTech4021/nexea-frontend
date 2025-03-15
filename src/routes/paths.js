// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
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
      addOn: `${ROOTS.DASHBOARD}/ticket-type/addOn`,
    },
    discountCode: {
      root: `${ROOTS.DASHBOARD}/discount-code`,
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
    },
    whatsappTemplate: {
      root: `${ROOTS.DASHBOARD}/templates`,
    },
    attendees: `${ROOTS.DASHBOARD}/attendees`,
    test: `${ROOTS.DASHBOARD}/test`,
    employee: `${ROOTS.DASHBOARD}/employee`,
    Qr: `${ROOTS.DASHBOARD}/qr`,
  },
};
