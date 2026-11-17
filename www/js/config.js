// Where the two serverless functions (api/chat.js and api/air.js) live.
// - Website on Vercel: leave as '' (same origin, calls /api/chat).
// - iOS app (Capacitor): set to your deployed site, e.g. 'https://lungitude.vercel.app'
//   because the app itself is served from capacitor://localhost.
const isNativeShell = location.protocol === 'capacitor:' || location.protocol === 'ionic:';

export const CONFIG = {
  API_BASE: isNativeShell ? 'https://YOUR-PROJECT.vercel.app' : '',
  // Keep Gemini disabled unless a parent or guardian has set up and approved the API account.
  AI_ENABLED: false,
  MAP_CENTER: [34.05, -117.75],
  MAP_ZOOM: 9,
  // Sample-data fallback boundary; live AirNow queries use the current U.S. map location.
  BBOX: { minLat: 32.5, maxLat: 35.3, minLng: -120.6, maxLng: -114.9 },
};
