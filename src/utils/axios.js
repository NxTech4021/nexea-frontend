import axios from 'axios';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: HOST_API,
  withCredentials: true
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
    forgetPassword: '/api/auth/forget-password',
    resetPassword: '/api/auth/reset-password',
    logout: '/api/auth/logout',
    update: '/api/update',
    verify: '/api/auth/verify',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  events: {
    detail: (id) => `/api/event/${id}`,
    event: '/api/event',
    create: '/api/event/',
    list: '/api/event/',
    update: '/api/event/update',
    delete: '/api/event/delete',
    text: '/api/event/sendtext',
    image: '/api/event/sendimage',
    location: '/api/event/sendlocation',
  },
  attendee: {
    root: '/api/attendee/',
    create: '/api/attendee/create',
    upload: '/api/attendee/upload',
    update: '/api/attendee/update',
    checkIn: '/api/attendee/checkInAttendee',
    list: '/api/attendees',
    event: {
      list: '/api/attendee/event',
    },
    checkedIn: '/api/attendee',
  },
  users: {
    list: '/api/users',
  },
  tickets: {
    //toggle: '/api/tickets/toggle',
    toggle: (id) => `/api/tickets/toggle/${id}`,
  },
  ticketType: {
    get: '/api/ticket-type/',
    getByEventId: (id) => `/api/ticket-type/getTicketsByEvent/${id}`,
    create: '/api/ticket-type/',
    edit: (id) => `/api/ticket-type/${id}`,
    delete: (id) => `/api/ticket-type/${id}`,
    generateUrl: '/api/ticket-type/generateUrl',
    addOn: {
      root: `/api/add-on`,
    },
  },
  cart: {
    root: '/api/cart/',
    get: (id, eventId, ticketTypeId) =>
      `/api/cart/${id}?eventId=${eventId}&ticketTypeId=${ticketTypeId}`,
    event: (id) => `/api/cart/tickets/${id}`,
    createSession: '/api/cart',
    addTicket: `/api/cart/addTicket`,
    extendSession: '/api/cart/extendSession',
    removeTicket: '/api/cart/removeCartItem',
  },
  discount: {
    get: '/api/discount/',
    create: '/api/discount/',
    update: `/api/discount/`,
    redeem: '/api/discount/redeem',
    track: (discountCodeId) => `/api/discount/trackDiscountCodeRedemption/${discountCodeId}`,
    add: '/api/discount/addDiscountCode',
    delete: (id) => `/api/discount/delete/${id}`,
    remove: '/api/cart/removeDiscountCode',
  },
  order: {
    root: '/api/order/',
  },
};
