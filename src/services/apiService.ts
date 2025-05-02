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

// Corrected LoginData interface to match backend expectation
interface LoginData {
  usernameOrEmail: string;
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