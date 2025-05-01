import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

const useGetAttendees = (id) => {
  const { data, isLoading, mutate } = useSWR(
    !id ? endpoints.attendee.list : `${endpoints.attendee.event.list}/${id}`,
    fetcher
  );

  const memoizedValue = useMemo(() => ({ data, isLoading, mutate }), [data, isLoading, mutate]);

  return memoizedValue;
};

export default useGetAttendees;
