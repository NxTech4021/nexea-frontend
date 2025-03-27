import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import { Box, List } from '@mui/material';
import Collapse from '@mui/material/Collapse';

import { usePathname } from 'src/routes/hooks';
import { useActiveLink } from 'src/routes/hooks/use-active-link';

import NavItem from './nav-item';

// ----------------------------------------------------------------------

export default function NavList({ data, depth, slotProps }) {
  const pathname = usePathname();

  const active = useActiveLink(data.path, !!data.children);

  const [openMenu, setOpenMenu] = useState(active);

  useEffect(() => {
    if (!active) {
      handleCloseMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggleMenu = useCallback(() => {
    if (data.children) {
      setOpenMenu((prev) => !prev);
    }
  }, [data.children]);

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  return (
    <>
      <NavItem
        open={openMenu}
        onClick={handleToggleMenu}
        //
        title={data.title}
        path={data.path}
        icon={data.icon}
        info={data.info}
        roles={data.roles}
        caption={data.caption}
        disabled={data.disabled}
        //
        depth={depth}
        hasChild={!!data.children}
        externalLink={data.path.includes('http')}
        currentRole={slotProps?.currentRole}
        //
        active={active}
        className={active ? 'active' : ''}
        sx={{
          mb: `${slotProps?.gap}px`,
          ...(depth === 1 ? slotProps?.rootItem : slotProps?.subItem),
        }}
      />
      {!!data.children && (
        <Collapse in={openMenu} unmountOnExit>
          <Box paddingLeft={2}>
            <NavSubList data={data.children} depth={depth} slotProps={slotProps} />
          </Box>
        </Collapse>
      )}
    </>
  );
}

NavList.propTypes = {
  data: PropTypes.object,
  depth: PropTypes.number,
  slotProps: PropTypes.object,
};

// ----------------------------------------------------------------------

function NavSubList({ data, depth, slotProps }) {
  return (
    <List
      sx={{
        padding: 0,
        margin: 0,
        listStyleType: 'none',
        position: 'relative',
        '&:before': {
          top: 0,
          left: 0,
          width: 2,
          content: '""',
          position: 'absolute',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#343c48' : '#ebebeb'),
          bottom: 'calc(36px - 2px - 12px / 2)',
        },
      }}
    >
      {data.map((list) => (
        <Box
          // mt={1}
          paddingLeft={2}
          key={list.title}
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 10,
              left: 12,
              width: 14,
              height: 14,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#343c48' : '#ebebeb'),
              mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 14 14'%3E%3Cpath d='M1 1v4a8 8 0 0 0 8 8h4' stroke='%23efefef' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\") 50% 50% / 100% no-repeat",
              transform: 'translate(-12px, -4.8px)',
            },
          }}
        >
          <NavList key={list.title} data={list} depth={depth + 1} slotProps={slotProps} />
        </Box>
      ))}
    </List>
  );
}

NavSubList.propTypes = {
  data: PropTypes.array,
  depth: PropTypes.number,
  slotProps: PropTypes.object,
};
