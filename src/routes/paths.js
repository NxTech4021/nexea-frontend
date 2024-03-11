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
    },
    attendees: `${ROOTS.DASHBOARD}/attendees`,
    test: `${ROOTS.DASHBOARD}/test`,
    employee: `${ROOTS.DASHBOARD}/employee`,
  },
};
