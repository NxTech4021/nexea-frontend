/* eslint-disable prefer-rest-params */
import { useEffect } from 'react';

const useFacebookPixel = (pixelId) => {
  useEffect(() => {
    // Load the Pixel script only if it's not already loaded
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        // eslint-disable-next-line no-multi-assign
        n = f.fbq = function () {
          // eslint-disable-next-line no-unused-expressions, prefer-spread
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      // Initialize Facebook Pixel
      window.fbq('init', pixelId);
    }

    // Track page view
    window.fbq('track', 'PageView');
  }, [pixelId]);
};

export default useFacebookPixel;
