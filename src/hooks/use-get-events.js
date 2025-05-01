import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

const useGetEvents = () => {
  const { data, isLoading, mutate } = useSWR(endpoints.events.list, fetcher);

  const memoizedValue = useMemo(() => ({ data, isLoading, mutate }), [data, isLoading, mutate]);

  return memoizedValue;
};

export default useGetEvents;
