import { apiClient } from '../apiClient';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  password: string;
  email: string;
  isCreator: boolean;
}

export const loginUser = (data: LoginData) => {
  return apiClient.post('/auth/login', data);
};

export const signupUser = (data: SignupData) => {
  return apiClient.post('/auth/signup', data);
};
