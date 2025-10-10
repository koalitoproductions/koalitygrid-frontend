import axios from 'axios';

// Tvingar fram en ny deploy fredag kväll
const api = axios.create({
  baseURL: import.meta.env.VITE_API_HOST ?? (console.warn('API_HOST not set, using default'), 'http://localhost:8000'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/token/refresh/')) {
      originalRequest._retry = true;
      try {
        await api.post('/api/dj-rest-auth/token/refresh/', {}, { withCredentials: true });
        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.data);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Utility to get CSRF token from cookies
export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
