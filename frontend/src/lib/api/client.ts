import axios, { AxiosError } from 'axios';

// Ensure this matches the NEXT_PUBLIC_API_URL in .env.local
// Note: NEXT_PUBLIC_API_URL should point to the domain (e.g. http://localhost:8000)
// If you want the client to use /api/v1 by default, configure it here.
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${baseURL}/api/v1`, // Assuming API endpoints are under /api/v1
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Explicitly attach Authorization Bearer token and XSRF-TOKEN header on requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]*)/);
    if (match && match[2]) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[2]);
    }
  }
  return config;
});

// Interceptor to handle responses and common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized (Expired token or invalid session)
          console.warn('Unauthorized (401): Sesi telah kedaluwarsa atau tidak valid.');
          if (typeof window !== 'undefined') {
            const hadToken = localStorage.getItem('auth_token');
            localStorage.removeItem('auth_token');
            const currentPath = window.location.pathname;
            const isAuthPage = ['/signin', '/signup', '/auth/callback', '/reset-password'].some(
              (p) => currentPath.startsWith(p)
            );
            if (hadToken && !isAuthPage) {
              window.location.href = '/signin?error=session_expired';
            }
          }
          break;
        case 403:
          // Forbidden
          console.error('Forbidden (403): You do not have permission.');
          break;
        case 404:
          // Not Found
          console.error('Not Found (404): Resource not found.');
          break;
        case 422:
          // Unprocessable Entity (Validation Error)
          console.error('Validation Error (422):', error.response.data);
          break;
        case 500:
          // Server Error
          console.error('Server Error (500): An unexpected error occurred on the server.');
          break;
        default:
          console.error(`Error (${status}): An unexpected error occurred.`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Fetches the CSRF cookie from Laravel Sanctum.
 * Must be called before logging in or making POST/PUT/DELETE requests 
 * if CSRF protection is enforced by the backend.
 */
export const csrf = () => {
  return axios.get(`${baseURL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};
