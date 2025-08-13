import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const ICONS = {
  dashboard: <Iconify icon="solar:home-2-linear" width={20} />,
  events: <Iconify icon="solar:calendar-linear" width={20} />,
  ticket: <Iconify icon="solar:ticket-linear" width={20} />,
  addOn: <Iconify icon="solar:add-circle-linear" width={20} />,
  discount: <Iconify icon="solar:tag-linear" width={20} />,
  bulkDiscount: <Iconify icon="bxs:discount" width={20} />,
  orders: <Iconify icon="solar:bag-2-linear" width={20} />,
  attendees: <Iconify icon="solar:users-group-rounded-linear" width={20} />,
  qr: <Iconify icon="solar:qr-code-linear" width={20} />,
  employee: <Iconify icon="solar:user-linear" width={20} />,
  templates: <Iconify icon="solar:chat-round-linear" width={20} />,
};

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      // {
      //   subheader: 'Overview',
      //   items: [{ title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard }],
      // },
      {
        // subheader: 'Event Management',
        items: [
          {
            title: 'Events',
            path: paths.dashboard.events.root,
            icon: ICONS.events,
          },
          {
            title: 'Ticket Types',
            path: paths.dashboard.ticketType.root,
            icon: ICONS.ticket,
          },
          {
            title: 'Ticket Add Ons',
            path: paths.dashboard.addOn.root,
            icon: ICONS.addOn,
          },
          {
            title: 'Discount Codes',
            path: paths.dashboard.discountCode.root,
            icon: ICONS.discount,
          },
          // {
          //   title: 'Bulk Discount',
          //   path: paths.dashboard.bulkDiscount.root,
          //   icon: ICONS.bulkDiscount,
          // },
          {
            title: 'Orders',
            path: paths.dashboard.order.root,
            icon: ICONS.orders,
          },

          // {
          //   title: 'Attendees',
          //   path: paths.dashboard.attendees,
          //   icon: ICONS.attendees,
          // },
          // {
          //   title: 'Whatsapp Templates',
          //   path: paths.dashboard.whatsappTemplate.root,
          //   icon: ICONS.templates,
          // },
          // {
          //   title: 'QR',
          //   path: paths.dashboard.Qr,
          //   icon: ICONS.qr,
          // },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: 'nexea management',
        items: [
          {
            title: 'Users',
            path: paths.dashboard.employee,
            icon: ICONS.employee,
          },
        ],
      },
    ],
    []
  );

  return data;
}
