import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

export const useGetUser = () => {
  const { data, isLoading } = useSWR(endpoints.users.list, fetcher, {
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  const memoizedValue = useMemo(() => ({ data, isLoading }), [data, isLoading]);

  return memoizedValue;
};
