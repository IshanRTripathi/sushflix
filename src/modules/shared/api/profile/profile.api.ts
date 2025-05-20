import { apiClient } from '../apiClient';

export interface ProfileData {
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export const getProfile = (userId: string) => {
  return apiClient.get(`/api/users/${userId}`);
};

export const getProfileByUsername = (username: string) => {
  return apiClient.get(`/api/users/username/${username}`);
};

export const updateUserProfile = (userId: string, data: ProfileData) => {
  return apiClient.put(`/api/users/${userId}`, data);
};

export const updateUserSettings = (userId: string, settings: any) => {
  return apiClient.put(`/api/users/${userId}/settings`, settings);
};

export const uploadProfilePicture = (username: string, file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return apiClient.post(`/api/users/${username}/upload-avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadCoverPhoto = (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('cover', file);
  
  return apiClient.post(`/api/users/${userId}/upload-cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
