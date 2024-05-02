import { useState, useEffect } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

const useGetEvents = () => {
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    const getEvents = async () => {
      try {
        console.log('Fetching total events...');
        const response = await axiosInstance.get(endpoints.events.list);
        setTotalEvents(response.data.events.length);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    getEvents();
  }, []); // Run only once on component mount

  return { totalEvents };
};

export default useGetEvents;
