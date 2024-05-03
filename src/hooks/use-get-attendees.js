import { useState, useEffect } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

const useGetAttendees = () => {
  const [totalAttendees, setTotalAttendees] = useState(0);

  useEffect(() => {
    const getAttendees = async () => {
      try {
        console.log('Fetching total attendees...');
        const response = await axiosInstance.get(endpoints.attendee.list);
        setTotalAttendees(response.data.attendee.length);
      } catch (error) {
        console.error('Error fetching attendees:', error);
      }
    };

    getAttendees();
  }, []); // Run only once on component mount

  return { totalAttendees };
};

export default useGetAttendees;
