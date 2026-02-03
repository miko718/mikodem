// API Configuration
// Set EXPO_PUBLIC_API_URL in .env for physical device (e.g. http://192.168.1.133:3001/api)
// iOS Simulator: localhost | Android Emulator: 10.0.2.2 | Device: your computer IP
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    const url = process.env.EXPO_PUBLIC_API_URL;
    return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
  }
  const isDev = (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development';
  if (!isDev) return 'https://your-production-api.com/api';
  // Simulator/emulator default
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
