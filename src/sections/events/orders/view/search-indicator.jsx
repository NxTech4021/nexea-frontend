import PropTypes from 'prop-types';

import { Box, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

const SearchMatchIndicator = ({ searchContext, searchQuery }) => {
  const theme = useTheme();

  if (!searchContext || !searchQuery) return null;

  const getMatchConfig = (context) => {
    switch (context.type) {
      case 'orderNumber':
        return {
          icon: 'eva:hash-outline',
          color: theme.palette.info.main,
          tooltip: `Order ID: ${context.value}`,
        };
      case 'buyerName':
        return {
          icon: 'eva:person-outline',
          color: theme.palette.primary.main,
          tooltip: `Buyer: ${context.value}`,
        };
      case 'buyerEmail':
        return {
          icon: 'eva:email-outline',
          color: theme.palette.secondary.main,
          tooltip: `Email: ${context.value}`,
        };
      case 'buyerPhone':
        return {
          icon: 'eva:phone-outline',
          color: theme.palette.warning.main,
          tooltip: `Phone: ${context.value}`,
        };
      case 'attendee':
        return {
          icon: 'eva:people-outline',
          color: theme.palette.success.main,
          tooltip: `Attendee: ${context.value}`,
        };
      case 'discountCode':
        return {
          icon: 'eva:pricetags-outline',
          color: theme.palette.error.main,
          tooltip: `Discount: ${context.value}`,
        };
      default:
        return null;
    }
  };

  const config = getMatchConfig(searchContext);
  if (!config) return null;

  return (
    <Tooltip title={config.tooltip} arrow placement="top">
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: config.color,
          color: 'white',
          fontSize: '0.6rem',
          fontWeight: 700,
          cursor: 'help',
        }}
      >
        <Iconify icon={config.icon} width={10} height={10} />
      </Box>
    </Tooltip>
  );
};

SearchMatchIndicator.propTypes = {
  searchContext: PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string,
    field: PropTypes.string,
    attendeeCount: PropTypes.number,
  }),
  searchQuery: PropTypes.string,
};

export default SearchMatchIndicator; 