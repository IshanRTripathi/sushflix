import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request or response interceptors if needed

export const signupUser = (data: { username: string; password: string; email: string; isCreator: boolean }) => {
  return apiClient.post('/auth/signup', data);
};

interface LoginData {
  username?: string;
  email?: string; // Assuming login can be by username or email
  password: string;
}

export const loginUser = (data: LoginData) => {
  return apiClient.post('/auth/login', data);
};

// Add other API functions here as you refactor
// export const getContent = (contentId: string) => {
//   return apiClient.get(`/content/${contentId}`);
// };

export default apiClient;