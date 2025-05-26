import axios from 'axios';
import { API_BASE_URL } from '../config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Request interceptor for token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      console.log('[apiClient] Token from localStorage:', token ? 'Token found' : 'No token found');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[apiClient] Added Authorization header to request');
      } else {
        console.warn('[apiClient] No auth token found in localStorage');
      }
      
      return config;
    } catch (error) {
      console.error('[apiClient] Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('[apiClient] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses if needed
    console.log(`[apiClient] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('[apiClient] API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('[apiClient] Unauthorized - Token may be invalid or expired');
        // Clear the token but don't redirect here
        localStorage.removeItem('token');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('[apiClient] No response received:', {
        url: error.config?.url,
        method: error.config?.method,
        error: error.message
      });
    } else {
      // Something happened in setting up the request
      console.error('[apiClient] Request setup error:', {
        message: error.message,
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
