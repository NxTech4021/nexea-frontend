import { useMemo } from 'react';
import useSWR from 'swr/immutable';

import { fetcher, endpoints } from 'src/utils/axios';

export const useGetCart = () => {
  const { data, isLoading, mutate, error } = useSWR(endpoints.cart.root, fetcher);

  const memoizedValue = useMemo(
    () => ({ data, isLoading, error, mutate }),
    [data, isLoading, error, mutate]
  );

  return memoizedValue;
};
