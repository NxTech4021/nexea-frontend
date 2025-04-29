import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

export const useGetAllDiscountCode = () => {
  const { data: discountCodes, isLoading: discountCodesIsLoading, mutate: refetchDiscountCodes } = useSWR(
    endpoints.discount.get,
    fetcher
  );

  const memoizedValue = useMemo(
    () => ({ discountCodes, discountCodesIsLoading,  refetchDiscountCodes }),
    [discountCodes, discountCodesIsLoading,  refetchDiscountCodes]
  );

  return memoizedValue;
};

export const deleteDiscountCode = async (id) => {
  const response = await axiosInstance.delete(endpoints.discount.delete(id));
  return response.data;
};
