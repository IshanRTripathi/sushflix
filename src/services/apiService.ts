import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // Default headers - will be overridden for file uploads
    'Content-Type': 'application/json',
  },
});

// Add request or response interceptors if needed

export const signupUser = (data: { username: string; password: string; email: string; isCreator: boolean }) => {
  return apiClient.post('/auth/signup', data);
};

// Corrected LoginData interface to match backend expectation
interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export const loginUser = (data: LoginData) => {
  return apiClient.post('/auth/login', data);
};

// Function for uploading content using FormData
export const uploadContent = (formData: FormData, token: string | null, onUploadProgress?: (progressEvent: any) => void) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is missing'));
  }
  return apiClient.post('/content/upload', formData, {
    headers: {
      // Let Axios set Content-Type for FormData automatically
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
    onUploadProgress: onUploadProgress, // Pass progress callback
  });
};


// Add other API functions here as you refactor
// export const getContent = (contentId: string) => {
//   return apiClient.get(`/content/${contentId}`);
// };

export default apiClient;