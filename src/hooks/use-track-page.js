// import { useEffect } from 'react';
// import ReactPixel from 'react-facebook-pixel';

// const options = {
//   autoConfig: true,
//   debug: false,
// };

// export const initFacebookPixel = (pixelId) => {
//   ReactPixel.init(pixelId, undefined, options);
//   ReactPixel.pageView(); // For initial page load
// };

// let pixelInitialized = false;

// export const useMetaPixel = (
//   eventName,
//   eventData = {},
//   firePageView = false,
//   pixelId = '598753975606755'
// ) => {
//   useEffect(() => {
//     if (!pixelInitialized) {
//       ReactPixel.init(pixelId, {}, { autoConfig: true, debug: false });
//       pixelInitialized = true;
//     }

//     if (firePageView) {
//       ReactPixel.pageView();
//     }

//     if (eventName) {
//       ReactPixel.track(eventName, eventData);
//     }
//   }, [eventName, eventData, firePageView, pixelId]);
// };

import ReactPixel from 'react-facebook-pixel';

let pixelInitialized = false;

export const trackMetaPixel = (
  eventName,
  eventData = {},
  firePageView = false,
  pixelId = '598753975606755'
) => {
  if (!pixelInitialized) {
    ReactPixel.init(pixelId, {}, { autoConfig: true, debug: false });
    pixelInitialized = true;
  }

  if (firePageView) {
    ReactPixel.pageView();
  }

  if (eventName) {
    ReactPixel.trackCustom(eventName, eventData);
  }
};
