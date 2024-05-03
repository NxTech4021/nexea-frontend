import { toast } from 'react-toastify';

import axiosInstance, { endpoints } from 'src/utils/axios';

const useUploadCSV = () => {
  const handleFileUpload = async (file, selectedEvent) => {
    // const file = event.target.files[0];

    // Create a FormData object
    const formData = new FormData();
    formData.append('eventId', selectedEvent);
    formData.append('file', file);

    try {
      // Send the FormData to the backend
      const response = await axiosInstance.post(endpoints.attendee.upload, formData); // remove/add /api if it doesnt work

      if (response.data.message) {
        toast.success('CSV uploaded successfully!');
        // handleCloseModal();
      } else {
        toast.error('Error uploading CSV.');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Error uploading CSV. Please try again.');
    }
  };

  return { handleFileUpload };
};

export default useUploadCSV;
