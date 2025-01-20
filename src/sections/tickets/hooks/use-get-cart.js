import { useContext } from 'react';

import { Cart } from '../context/ticket-context';

const useGetCartData = () => useContext(Cart);

export default useGetCartData;
