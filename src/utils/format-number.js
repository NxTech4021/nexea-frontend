/* eslint-disable consistent-return */
import PropTypes from 'prop-types';

export const formatLargeNumber = (number) => {
  // eslint-disable-next-line radix
  if (number < 1000) {
    return number; // No need for formatting
  }
  if (number < 1000000) {
    if (number < 10000) {
      // Format to 1 decimal place
      return `${(number / 1000).toFixed(2)}k`;
    }
    // Format to whole number
    return `${Math.round(number / 1000)}k`;
  }
  if (number < 10000000) {
    // Format to 1 decimal place
    return `${(number / 1000000).toFixed(2)}M`;
  }
  // Format to whole number
  return `${Math.round(number / 1000000)}M`;
};

formatLargeNumber.propTypes = {
  num: PropTypes.number,
};

export function fData(inputValue) {
  if (!inputValue) return '';

  if (inputValue === 0) return '0 Bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];

  const decimal = 2;

  const baseValue = 1024;

  const number = Number(inputValue);

  const index = Math.floor(Math.log(number) / Math.log(baseValue));

  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}
