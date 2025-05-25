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

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      displayName: string;
      email: string;
      profilePicture?: string;
      bio?: string;
      socialLinks?: {
        twitter?: string;
        instagram?: string;
        youtube?: string;
        website?: string;
      };
      isVerified: boolean;
      isFollowing?: boolean;
      stats: {
        posts: number;
        followers: number;
        following: number;
      };
      createdAt: string;
      updatedAt: string;
    };
  };
  message?: string;
}

export const getUserProfile = async (username: string): Promise<UserProfileResponse> => {
  try {
    const response = await apiClient.get(`/api/users/${username}`);
    return {
      success: true,
      data: {
        user: response.data.user
      }
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      data: {
        user: {
          id: '',
          username: '',
          displayName: '',
          email: '',
          isVerified: false,
          stats: {
            posts: 0,
            followers: 0,
            following: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      message: error instanceof Error ? error.message : 'Failed to fetch user profile'
    };
  }
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
