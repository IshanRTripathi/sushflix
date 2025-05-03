import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Add request interceptor for token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Corrected LoginData interface to match backend expectation
interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export const loginUser = (data: LoginData) => {
  return apiClient.post('/auth/login', data);
};

export const getProfile = (userId: string) => {
  return apiClient.get(`/profile/${userId}`);
};

export const getProfileByUsername = (username: string) => {
  return apiClient.get(`/profile/username/${username}`);
};

export const updateProfile = (userId: string, data: any) => {
  return apiClient.put(`/profile/${userId}`, data);
};

export const uploadProfilePicture = (userId: string, file: any) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return apiClient.post(`/profile/${userId}/picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default apiClient;