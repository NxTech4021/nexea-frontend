import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// export const useGetCart = (id, eventId, ticketTypeId) => {
//   const { data, isLoading, mutate, error } = useSWR(
//     id ? endpoints.cart.get(id, eventId, ticketTypeId) : null,
//     fetcher
//   );

// const memoizedValue = useMemo(
//   () => ({ data, isLoading, error, mutate }),
//   [data, isLoading, error, mutate]
// );

// return memoizedValue;
// };

export const useGetCart = () => {
  const { data, isLoading, mutate, error } = useSWR(endpoints.cart.root, fetcher);

  const memoizedValue = useMemo(
    () => ({ data, isLoading, error, mutate }),
    [data, isLoading, error, mutate]
  );

  return memoizedValue;
};
