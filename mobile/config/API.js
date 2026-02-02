// API Configuration
// For iOS Simulator: use localhost
// For Android Emulator: use 10.0.2.2 instead of localhost
// For physical device: use your computer's IP address (e.g., 192.168.1.130:3001)
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' 
  : 'https://your-production-api.com/api';

export default API_BASE_URL;
