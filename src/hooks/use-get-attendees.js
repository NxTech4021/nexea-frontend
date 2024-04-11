import { useState, useEffect } from 'react';

import axiosInstance from 'src/utils/axios';

const useGetAttendees = () => {
  const [totalAttendees, setTotalAttendees] = useState(0);

  const getAttendees = async () => {
    try {
      console.log('Rendered');
      const res = await axiosInstance.get('/api/attendees');
      setTotalAttendees(res?.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAttendees();
  }, [totalAttendees]);

  return { totalAttendees };
};

export default useGetAttendees;
