import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = import.meta.env.VITE_HOST_API;
export const ASSETS_API = import.meta.env.VITE_ASSETS_API;
export const APP_ID = import.meta.env.GUPSHUP_APP_ID || '2e10518a-ecf4-481c-8f81-330871b725ec';
export const APP_KEY = import.meta.env.GUPSHUP_APP_KEY || 'gbb3xcvdd67hah3v0so5bwiuwwyd6yyq';

// export const FIREBASE_API = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APPID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };

// export const AMPLIFY_API = {
//   userPoolId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_ID,
//   userPoolWebClientId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID,
//   region: import.meta.env.VITE_AWS_AMPLIFY_REGION,
// };

// export const AUTH0_API = {
//   clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
//   domain: import.meta.env.VITE_AUTH0_DOMAIN,
//   callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL,
// };

// export const MAPBOX_API = import.meta.env.VITE_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.events.root; // as '/dashboard'
