import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

export const useGetEvent = (eventId) => {
  const { data, isLoading, mutate } = useSWR(endpoints.cart.event(eventId), fetcher);

  const memoizedValue = useMemo(
    () => ({ eventData: data, eventLoading: isLoading, eventMutate: mutate }),
    [data, isLoading, mutate]
  );

  return memoizedValue;
};
