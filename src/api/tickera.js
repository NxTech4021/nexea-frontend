import axiosInstance from 'src/utils/axios';

import { APP_ID, APP_KEY } from 'src/config-global';

const options = {
  method: 'GET',
  url: `https://api.gupshup.io/wa/app/${APP_ID}/template?pageNo=0&pageSize=5&templateStatus=APPROVED&languageCode=en`,
  headers: { accept: 'application/json', apikey: APP_KEY },
};

export const getAllTemplates = async () => {
  try {
    const res = await axiosInstance.request(options);
    return res?.data;
  } catch (error) {
    return error;
  }
};
