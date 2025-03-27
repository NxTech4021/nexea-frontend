import { useMemo } from 'react';

import QrCodeIcon from '@mui/icons-material/QrCode';

import { paths } from 'src/routes/paths';

import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  qr: <QrCodeIcon />,
};

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'Overview',
        items: [{ title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard }],
      },
      {
        subheader: 'Event Management',
        items: [
          {
            title: 'Events',
            path: paths.dashboard.events.root,
            icon: <Iconify icon="material-symbols:campaign" width={22} />,
            children: [
              {
                title: 'Overview',
                path: paths.dashboard.events.root,
              },
            ],
          },
          {
            title: 'Ticket Types',
            path: paths.dashboard.ticketType.root,
            icon: <Iconify icon="f7:tickets-fill" width={22} />,
            children: [
              {
                title: 'List',
                path: paths.dashboard.ticketType.root,
              },
              {
                title: 'Settings',
                path: paths.dashboard.ticketType.settings,
              },
              {
                title: 'Add Ons',
                path: paths.dashboard.ticketType.addOn,
                children: [
                  {
                    title: 'List',
                    path: paths.dashboard.ticketType.addOn,
                  },
                ],
              },
            ],
          },
          {
            title: 'Discount Codes',
            path: paths.dashboard.discountCode.root,
            icon: <Iconify icon="tabler:discount-filled" width={22} />,
          },
          {
            title: 'Orders',
            path: paths.dashboard.order.root,
            icon: <Iconify icon="lets-icons:order-fill" width={22} />,
          },

          // {
          //   title: 'Attendees',
          //   path: paths.dashboard.attendees,
          //   icon: <Icon icon="heroicons:users-16-solid" width={25} />,
          // },
          // {
          //   title: 'Whatsapp Templates',
          //   path: paths.dashboard.whatsappTemplate.root,
          //   icon: <Icon icon="ic:baseline-whatsapp" width={25} />,
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
      // {
      //   subheader: 'nexea management',
      //   items: [
      //     {
      //       title: 'employee',
      //       path: paths.dashboard.employee,
      //       icon: ICONS.user,
      //       // children: [{ title: 'employee', path: paths.dashboard.group.root }],
      //     },
      //   ],
      // },
    ],
    []
  );

  return data;
}
