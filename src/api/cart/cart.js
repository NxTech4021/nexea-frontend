import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

export const useGetCart = (id) => {
  const { data, isLoading, mutate, error } = useSWR(`${endpoints.cart.root}/${id}`, fetcher);

  const memoizedValue = useMemo(
    () => ({
      data: data?.isCartExist ? data : null,
      isLoading,
      error,
      mutate,
      isCartExist: data?.isCartExist,
    }),
    [data, isLoading, error, mutate]
  );

  return memoizedValue;
};
