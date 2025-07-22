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
        disableGutters
        ref={ref}
        open={open}
        depth={depth}
        active={active}
        disabled={disabled}
        {...other}
      >
        {icon && (
          <Box component="span" className="icon">
            {icon}
          </Box>
        )}
        {/* Hide title in mini nav - only show icons */}
        {false && title && (
          <Box component="span" className="label">
            {title}
          </Box>
        )}
        {caption && (
          <Tooltip title={caption} arrow placement="right">
            <Iconify width={16} icon="eva:info-outline" className="caption" />
          </Tooltip>
        )}
        {info && subItem && (
          <Box component="span" className="info">
            {info}
          </Box>
        )}

        {hasChild && <Iconify width={16} className="arrow" icon="eva:arrow-ios-forward-fill" />}
      </StyledNavItem>
    );

    const contentWithTooltip = !subItem && title ? (
      <Tooltip 
        title={title} 
        arrow 
        placement="right"
        enterDelay={300}
        leaveDelay={100}
      >
        <Box>
          {renderContent}
        </Box>
      </Tooltip>
    ) : renderContent;

    // Hidden item by role
    if (roles && !roles.includes(`${currentRole}`)) {
      return null;
    }

    if (hasChild) {
      return contentWithTooltip;
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
            width: 1,
            ...(disabled && {
              cursor: 'default',
            }),
          }}
        >
          {contentWithTooltip}
        </Link>
      );

    return (
      <Link
        component={RouterLink}
        href={path}
        color="inherit"
        underline="none"
        sx={{
          width: 1,
          ...(disabled && {
            cursor: 'default',
          }),
        }}
      >
        {contentWithTooltip}
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

  const lightMode = theme.palette.mode === 'light';

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
      borderRadius: 6,
      color: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      width: 22,
      height: 22,
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      textTransform: 'capitalize',
      fontSize: '0.75rem',
    },
    caption: {
      color: theme.palette.text.disabled,
    },
    container: {
      width: 40, // Match the parent styling
      height: 40, // Match the parent styling
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  };

  return {
    // Root item
    ...(!subItem && {
      ...baseStyles.item,
      ...baseStyles.container,
      fontSize: 10,
      minHeight: 40, // Match parent height
      lineHeight: '14px',
      textAlign: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0, // Remove padding for perfect centering
      margin: 0, // Remove margin for perfect centering
      fontWeight: theme.typography.fontWeightMedium,
      '& .icon': {
        ...baseStyles.icon,
        margin: 0, // Remove any margin from icon
      },
      '& .label': {
        ...noWrapStyles,
        ...baseStyles.label,
        marginTop: theme.spacing(0.5),
      },
      '& .caption': {
        ...baseStyles.caption,
        top: 11,
        left: 6,
        position: 'absolute',
      },
      '& .arrow': {
        top: 11,
        right: 6,
        position: 'absolute',
      },
      ...(active && {
        fontWeight: theme.typography.fontWeightSemiBold,
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
      ...theme.typography.body2,
      minHeight: 32,
      padding: theme.spacing(0, 1),
      fontWeight: theme.typography.fontWeightMedium,
      '& .icon': {
        ...baseStyles.icon,
        marginRight: theme.spacing(1),
      },
      '& .label': {
        ...baseStyles.label,
        flexGrow: 1,
      },
      '& .caption': {
        ...baseStyles.caption,
        marginLeft: theme.spacing(0.75),
      },
      '& .info': {
        display: 'inline-flex',
        marginLeft: theme.spacing(0.75),
      },
      '& .arrow': {
        marginLeft: theme.spacing(0.75),
        marginRight: theme.spacing(-0.5),
      },
      ...(active && {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.action.selected,
        fontWeight: theme.typography.fontWeightSemiBold,
      }),
      ...(opened && {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.action.hover,
      }),
    }),
  };
});
