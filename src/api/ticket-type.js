// eslint-disable-next-line import/no-unresolved
import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

export const useGetAllTicketTypes = () => {
  const { data, isLoading, mutate } = useSWR(endpoints.ticketType.get, fetcher, {
    revalidateIfStale: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
  });

  const memoizedValue = useMemo(() => ({ data, isLoading, mutate }), [data, isLoading, mutate]);

  return memoizedValue;
};

export const createTicketType = async ({
  title,
  type,
  eventId,
  category,
  validity,
  description,
  price,
  quantity,
  minimumTicketPerOrder,
  maximumTicketPerOrder,
  isActive = false,
  isDraft = false,
  selectedAddOns,
}) => {
  try {
    if (
      !isDraft &&
      (!title || !type || !eventId || (type !== 'After Party' && !category) || !price || !quantity)
    ) {
      throw new Error('Arguments not enough');
    }

    const data = await axiosInstance.post(endpoints.ticketType.create, {
      title,
      type,
      eventId,
      category,
      validity,
      price,
      quantity,
      isActive,
      isDraft,
      minimumTicketPerOrder,
      maximumTicketPerOrder,
      description,
      selectedAddOns,
    });

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const editTicketType = async () => {};

export const deleteTicketType = async (id) => {
  try {
    await axiosInstance.delete(endpoints.ticketType.delete(id));

    return 'Successfully deleted';
  } catch (error) {
    throw new Error(error);
  }
};
