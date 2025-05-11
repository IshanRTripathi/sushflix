import axios from 'axios';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
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

// Response interceptor for error handling
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

// Types
export interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export interface SignupData {
  username: string;
  password: string;
  email: string;
  isCreator: boolean;
}

// Auth endpoints
export const loginUser = (data: LoginData) => {
  return apiClient.post('/api/auth/login', data);
};

export const signupUser = (data: SignupData) => {
  return apiClient.post('/api/auth/signup', data);
};

// Profile endpoints
export const getProfile = (userId: string) => {
  return apiClient.get(`/api/users/${userId}`);
};

export const getProfileByUsername = (username: string) => {
  return apiClient.get(`/api/users/${username}`);
};

export const updateUserProfile = (userId: string, data: any) => {
  return apiClient.patch(`/api/users/${userId}`, data);
};

export const updateUserSettings = (userId: string, settings: any) => {
  return apiClient.patch(`/api/users/${userId}/settings`, settings);
};

export const uploadProfilePicture = (username: string, file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return apiClient.post(`/api/users/${username}/picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadCoverPhoto = (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('coverPhoto', file);
  return apiClient.post(`/api/users/${userId}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const followUser = (targetUserId: string) => {
  return apiClient.post(`/api/users/${targetUserId}/follow`);
};

export const unfollowUser = (targetUserId: string) => {
  return apiClient.delete(`/api/users/${targetUserId}/follow`);
};

export const getUserStats = (userId: string) => {
  return apiClient.get(`/api/users/${userId}/stats`);
};

export const searchUsers = (query: string, page = 1, limit = 20) => {
  return apiClient.get('/api/users/search', {
    params: { query, page, limit }
  });
};

export const requestVerification = (userId: string) => {
  return apiClient.post(`/api/users/${userId}/verify`);
};

export default apiClient;