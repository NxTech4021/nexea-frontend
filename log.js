const price = 'RM 20,000.00';

const formatPrice = (price) => {
  return price.split(' ')[1];
};

console.log(parseFloat(formatPrice(price)));
