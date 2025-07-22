import { useRef } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { usePathname } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useSettingsContext } from 'src/components/settings';

import Main from './main';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';

// ----------------------------------------------------------------------

// Function to get page title based on pathname
const getPageTitle = (pathname) => {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/dashboard/events') return 'Events';
  if (pathname === '/dashboard/events/create') return 'Create Event';
  if (pathname === '/dashboard/ticket-type') return 'Ticket Types';
  if (pathname === '/dashboard/add-on') return 'Ticket Add Ons';
  if (pathname === '/dashboard/discount-code') return 'Discount Codes';
  if (pathname === '/dashboard/order') return 'Orders';
  if (pathname === '/dashboard/attendees') return 'Attendees';
  if (pathname === '/dashboard/employee') return 'Employees';
  if (pathname.startsWith('/dashboard/events/') && pathname.includes('/')) {
    if (pathname.includes('notifcationStatus')) return 'Notification Status';
    return 'Event Details';
  }
  if (pathname.startsWith('/dashboard/order/') && pathname !== '/dashboard/order') {
    return 'Order Details';
  }
  if (pathname.startsWith('/dashboard/order/event/')) {
    return 'Event Orders';
  }
  if (pathname === '/dashboard/user/profile') return 'Profile';
  if (pathname === '/dashboard/templates') return 'WhatsApp Templates';
  if (pathname === '/dashboard/qr') return 'QR Scanner';
  
  // Default title
  return 'Dashboard';
};

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const settings = useSettingsContext();
  const pathname = usePathname();

  const testRef = useRef(null);

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} onOpenNav={nav.onTrue} />;

  const pageTitle = getPageTitle(pathname);

  if (isHorizontal) {
    return (
      <>
        {lgUp ? renderHorizontal : renderNavVertical}

        <Main title={pageTitle} onOpenNav={nav.onTrue}>{children}</Main>
      </>
    );
  }

  return (
    <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          overflow: 'hidden',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Sidebar - participates in flex layout */}
        <Box sx={{ flexShrink: 0 }}>
          {!isMini || !lgUp ? renderNavVertical : renderNavMini}
        </Box>

        {/* Main content area */}
        <Main title={pageTitle} onOpenNav={nav.onTrue}>{children}</Main>
      </Box>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
