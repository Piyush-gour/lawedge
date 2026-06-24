import axios from 'axios';

/**
 * Pre-configured Axios instance that automatically
 * attaches the JWT Bearer token to every request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if token is invalid
      if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
