import { useState, useEffect } from 'react';

import axiosInstance from 'src/utils/axios';

const useGetEvents = () => {
    const [totalEvents, setTotalEvents] = useState(0);
  
    const getEvents = async () => {
      try {
        console.log('Fetching total events...');
        const response = await axiosInstance.get('');
        setTotalEvents(response.data.length);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
  
    useEffect(() => {
      getEvents();
    }, []); // Run only once on component mount
  
    return { totalEvents };
  };
  
  export default useGetEvents;
  
