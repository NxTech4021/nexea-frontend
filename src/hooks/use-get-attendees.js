import { useState, useEffect } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

const useGetAttendees = (id) => {
  const [totalAttendees, setTotalAttendees] = useState(0);

  useEffect(() => {
    const getAttendees = async () => {
      try {
        const response = await axiosInstance.get(endpoints.attendee.list);
        setTotalAttendees(response.data.length);
      } catch (error) {
        console.error('Error fetching attendees:', error);
      }
    };

    const getAttendeesByEventId = async () => {
      try {
        const response = await axiosInstance.get(`${endpoints.attendee.event.list}/${id}`);
        setTotalAttendees(response.data.length);
      } catch (error) {
        console.error('Error fetching attendees:', error);
      }
    };

    if (id) {
      getAttendeesByEventId();
    } else {
      getAttendees();
    }
  }, [id]); // Run only once on component mount

  return { totalAttendees };
};

export default useGetAttendees;
