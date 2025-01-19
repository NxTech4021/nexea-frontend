import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

export const useGetAllDiscountCode = () => {
  const { data: discountCodes, isLoading: discountCodesIsLoading } = useSWR(
    endpoints.discount.get,
    fetcher
  );

  const memoizedValue = useMemo(
    () => ({ discountCodes, discountCodesIsLoading }),
    [discountCodes, discountCodesIsLoading]
  );

  return memoizedValue;
};
