// eslint-disable-next-line import/no-unresolved
import useSWR from 'swr';
import { useMemo } from 'react';
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

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
  typeId,
  eventId,
  categoryId,
  validity,
  description,
  price,
  quantity,
  minimumTicketPerOrder,
  maximumTicketPerOrder,
  isActive = false,
  isDraft = false,
}) => {
  try {
    //  Debugging Logs: Check API URL & Payload before making request
    console.log(" API Endpoint:", endpoints.ticketType.create);
    console.log("Request Payload:", {
      title,
      typeId,
      eventId,
      categoryId,
      validity,
      description,
      price,
      quantity,
      minimumTicketPerOrder,
      maximumTicketPerOrder,
      isActive,
      isDraft,
    });

  
    const response = await axiosInstance.post(endpoints.ticketType.create, {
      title,
      typeId,
      eventId,
      categoryId,
      validity,
      description,
      price,
      quantity,
      minimumTicketPerOrder,
      maximumTicketPerOrder,
      isActive,
      isDraft,
    });

    // ✅ Debugging Logs: Check API Response
    console.log("✅ API Response:", response.data);
    
    return response;
  } catch (error) {
    console.error(" API Error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Failed to create ticket type");
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
