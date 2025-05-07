import { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

const pixelId = process.env.VITE_PIXEL_ID || ''; // Replace with your real Pixel ID

export const useMetaPixel = (eventName, eventData = {}, firePageView = false) => {
  useEffect(() => {
    ReactPixel.init(pixelId, {}, { autoConfig: true, debug: false });

    if (firePageView) {
      ReactPixel.pageView();
    }

    if (eventName) {
      ReactPixel.track(eventName, eventData);
    }
  }, [eventName, eventData, firePageView]);
};
