import { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

// const pixelId = import.meta.env.VITE_PIXEL_ID || '1213108609599419'; // Replace with your real Pixel ID

// console.log(pixelId);

let pixelInitialized = false;

export const useMetaPixel = (
  eventName,
  eventData = {},
  firePageView = false,
  pixelId = '598753975606755'
) => {
  useEffect(() => {
    if (!pixelInitialized) {
      ReactPixel.init(pixelId, {}, { autoConfig: true, debug: false });
      pixelInitialized = true;
    }

    if (firePageView) {
      ReactPixel.pageView();
    }

    if (eventName) {
      ReactPixel.track(eventName, eventData);
    }
  }, [eventName, eventData, firePageView, pixelId]);
};
