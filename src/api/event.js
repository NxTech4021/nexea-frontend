import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

export const useGetAllEvents = (id) => {
  const url = id ? endpoints.events.detail(id) : endpoints.events.list;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
  });

  const memoizedValue = useMemo(
    () => ({ data, isLoading, error, mutate }),
    [data, isLoading, error, mutate]
  );

  return memoizedValue;
};
