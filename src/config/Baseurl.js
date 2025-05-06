// Get environment
const isProd = window.location.hostname !== 'localhost';

// Configure base URL based on environment
export const baseUrl = isProd
  ? "https://188.245.85.109:9908"
  : "http://188.245.85.109:9908";

// Configure API options for fetch calls
export const apiOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  // Needed for cross-origin requests
  credentials: 'include',
  mode: 'cors',
};

export default baseUrl;
