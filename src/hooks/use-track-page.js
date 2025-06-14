import { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

// const pixelId = import.meta.env.VITE_PIXEL_ID || '1213108609599419'; // Replace with your real Pixel ID

// console.log(pixelId);

export const useMetaPixel = (
  eventName,
  eventData = {},
  firePageView = false,
  pixelId = '1213108609599419'
) => {
  useEffect(() => {
    ReactPixel.init(pixelId, {}, { autoConfig: true, debug: false });

    if (firePageView) {
      ReactPixel.pageView();
    }

    if (eventName) {
      ReactPixel.track(eventName, eventData);
    }
  }, [eventName, eventData, firePageView, pixelId]);
};
