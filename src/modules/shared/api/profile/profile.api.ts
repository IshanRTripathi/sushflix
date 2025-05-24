import { apiClient } from '../apiClient';

export interface ProfileData {
  bio?: string;
  profilePicture?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export const getUserProfile = (username: string) => {
  return apiClient.get(`/api/users/${username}`);
};

export const updateUserProfile = (username: string, data: ProfileData) => {
  return apiClient.put(`/api/users/${username}`, data);
};

export const updateUserSettings = (username: string, settings: any) => {
  return apiClient.put(`/api/users/${username}/settings`, settings);
};

export const uploadProfilePicture = (username: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/api/users/${username}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const followUser = (targetUsername: string) => {
  return apiClient.post(`/api/users/${targetUsername}/follow`);
};

export const unfollowUser = (targetUsername: string) => {
  return apiClient.post(`/api/users/${targetUsername}/unfollow`);
};

export const getUserStats = (username: string) => {
  return apiClient.get(`/api/users/${username}/stats`);
};

export const searchUsers = (query: string, page = 1, limit = 20) => {
  return apiClient.get(`/api/users/search`, {
    params: { query, page, limit },
  });
};

export const requestVerification = (username: string) => {
  return apiClient.post(`/api/users/${username}/verify`);
};
