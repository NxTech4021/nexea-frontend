import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { alpha, styled } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';

import { RouterLink } from 'src/routes/components';

import Iconify from '../../iconify';

// ----------------------------------------------------------------------

const NavItem = forwardRef(
  (
    {
      title,
      path,
      icon,
      info,
      disabled,
      caption,
      roles,
      //
      open,
      depth,
      active,
      hasChild,
      externalLink,
      currentRole = 'admin',
      ...other
    },
    ref
  ) => {
    const subItem = depth !== 1;

    const renderContent = (
      <StyledNavItem
        ref={ref}
        disableGutters
        open={open}
        depth={depth}
        active={active}
        disabled={disabled}
        {...other}
      >
        {!subItem && icon && (
          <Box component="span" className="icon">
            {icon}
          </Box>
        )}

        {subItem && icon ? (
          <Box component="span" className="icon">
            {icon}
          </Box>
        ) : (
          <Box component="span" className="sub-icon" />
        )}

        {title && (
          <Box component="span" sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <Box component="span" className="label">
              {title}
            </Box>

            {caption && (
              <Tooltip title={caption} placement="top-start">
                <Box component="span" className="caption">
                  {caption}
                </Box>
              </Tooltip>
            )}
          </Box>
        )}

        {info && (
          <Box component="span" className="info">
            {info}
          </Box>
        )}

        {hasChild && (
          <Iconify
            width={16}
            className="arrow"
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
          />
        )}
      </StyledNavItem>
    );

    // Hidden item by role
    if (roles && !roles.includes(`${currentRole}`)) {
      return null;
    }

    if (hasChild) {
      return renderContent;
    }

    if (externalLink)
      return (
        <Link
          href={path}
          target="_blank"
          rel="noopener"
          color="inherit"
          underline="none"
          sx={{
            ...(disabled && {
              cursor: 'default',
            }),
          }}
        >
          {renderContent}
        </Link>
      );

    return (
      <Link
        component={RouterLink}
        href={path}
        color="inherit"
        underline="none"
        sx={{
          ...(disabled && {
            cursor: 'default',
          }),
        }}
      >
        {renderContent}
      </Link>
    );
  }
);

NavItem.propTypes = {
  open: PropTypes.bool,
  active: PropTypes.bool,
  path: PropTypes.string,
  depth: PropTypes.number,
  icon: PropTypes.element,
  info: PropTypes.element,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  hasChild: PropTypes.bool,
  caption: PropTypes.string,
  externalLink: PropTypes.bool,
  currentRole: PropTypes.string,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default NavItem;

// ----------------------------------------------------------------------

const StyledNavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active, open, depth, theme }) => {
  const subItem = depth !== 1;

  const opened = open && !active;

  const deepSubItem = Number(depth) > 2;

  const noWrapStyles = {
    width: '100%',
    maxWidth: '100%',
    display: 'block',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  const baseStyles = {
    item: {
      marginBottom: 4,
      borderRadius: 6, 
      color: '#000',
      padding: theme.spacing(0.5, 0.5, 0.5, 0.5), 
      minHeight: 36, 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start', 
    },
    icon: {
      width: 18, 
      height: 18,
      flexShrink: 0,
      marginRight: theme.spacing(0.75), 
      marginLeft: theme.spacing(0.25), 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...noWrapStyles,
      ...theme.typography.body2,
      textTransform: 'capitalize',
      fontWeight: active ? theme.typography.fontWeightMedium : 400,
      fontSize: '0.875rem', 
      textAlign: 'left',
      flex: 1,
    },
    caption: {
      ...noWrapStyles,
      ...theme.typography.caption,
      color: theme.palette.text.disabled,
      fontSize: '0.75rem',
    },
    info: {
      display: 'inline-flex',
      marginLeft: theme.spacing(0.5), 
      fontSize: '0.75rem',
    },
    arrow: {
      flexShrink: 0,
      marginLeft: theme.spacing(0.5), 
      width: 16,
      height: 16,
    },
  };

  return {
    // Root item
    ...(!subItem && {
      ...baseStyles.item,
      minHeight: 36, 
      '& .icon': {
        ...baseStyles.icon,
      },
      '& .sub-icon': {
        display: 'none',
      },
      '& .label': {
        ...baseStyles.label,
      },
      '& .caption': {
        ...baseStyles.caption,
      },
      '& .info': {
        ...baseStyles.info,
      },
      '& .arrow': {
        ...baseStyles.arrow,
      },
      ...(active && {
        color: theme.palette.mode === 'light' ? 'white' : 'black',
        backgroundColor: theme.palette.mode === 'light' ? '#202531' : '#D1D6E0',
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'light' ? alpha('#1F1F1F', 0.9) : alpha('#FFFFFF', 0.9),
        },
      }),
      ...(opened && {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.action.hover,
      }),
    }),

    // Sub item
    ...(subItem && {
      ...baseStyles.item,
      minHeight: 32, 
      paddingLeft: `${theme.spacing(Number(depth) * 1.5)} !important`, 
      '& .icon': {
        ...baseStyles.icon,
        width: 16, 
        height: 16,
      },
      '& .label': {
        ...baseStyles.label,
        fontSize: '0.8125rem', 
      },
      '& .caption': {
        ...baseStyles.caption,
      },
      '& .info': {
        ...baseStyles.info,
      },
      '& .arrow': {
        ...baseStyles.arrow,
      },
      ...(active && {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.action.hover,
      }),
    }),

    // Deep sub item
    ...(deepSubItem && {
      paddingLeft: `${theme.spacing(Number(depth) * 1.5)} !important`, // Consistent indentation
    }),
  };
});
