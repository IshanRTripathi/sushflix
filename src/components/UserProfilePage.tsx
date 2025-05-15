import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';
import { UserProfile, SocialLinks, ProfileInput } from '../types/user';
import { profileService } from '../services/profileService';
import { logger } from '../utils/logger';
import LoadingSpinner from './common/LoadingSpinner';
import { Edit as EditIcon } from '@mui/icons-material';
import { Button as MuiButton } from '@mui/material';
import ProfilePictureUpload from './profile/ProfilePictureUpload';
import { useAuth } from './auth/AuthContext';

interface UserProfilePageProps {
  username: string;
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  statsData: {
    posts: number;
    followers: number;
    following: number;
  };
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ 
  username, 
  isFollowing, 
  onFollow, 
  statsData 
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.username === username;

  const [formData, setFormData] = useState<{
    displayName: string;
    bio: string;
    socialLinks: {
      website: string;
      twitter: string;
      youtube: string;
    };
    isCreator: boolean;
  }>({
    displayName: '',
    bio: '',
    socialLinks: {
      website: '',
      twitter: '',
      youtube: ''
    },
    isCreator: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      ...(name.startsWith('social.')
        ? {
            socialLinks: {
              ...(prev.socialLinks || {}),
              [name.split('.')[1] as keyof SocialLinks]: value
            }
          }
        : {
            [name]: value
          })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.socialLinks) return;

    try {
      const updates: ProfileInput = {
        displayName: formData.displayName || profile.displayName,
        bio: formData.bio || profile.bio,
        socialLinks: {
          ...profile.socialLinks,
          website: formData.socialLinks.website || '',
          twitter: formData.socialLinks.twitter || '',
          youtube: formData.socialLinks.youtube || ''
        }
      };
      
      const response = await profileService.updateUserProfile(profile.userId, updates);
      if (response.success && response.data) {
        setProfile(prev => ({
          ...prev!,
          ...updates,
          socialLinks: {
            ...prev!.socialLinks,
            ...updates.socialLinks
          },
          lastUpdated: new Date()
        } as UserProfile));
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
      logger.error('Error updating profile:', { error: err instanceof Error ? err.message : String(err) });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileService.getUserProfile(username);
        const profileData = response.data;
        if (profileData) {
          setProfile(profileData);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        setError('Failed to load profile');
        logger.error('Error fetching profile:', { error: err instanceof Error ? err.message : String(err) });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto" role="region" aria-label="User profile section">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto" role="region" aria-label="User profile section">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        bio: profile.bio,
        socialLinks: {
          website: profile.socialLinks?.website || '',
          twitter: profile.socialLinks?.twitter || '',
          youtube: profile.socialLinks?.youtube || ''
        },
        isCreator: profile.isCreator
      });
    }
  }, [profile]);

  return (
    <div className="w-full max-w-md mx-auto" role="region" aria-label="User profile section">
      <div className="bg-black text-white">
        <div className="p-6 pb-0 flex flex-col items-center">
          <div className="relative w-24 h-24" role="img" aria-label="User profile picture">
            <div className="w-full h-full rounded-full overflow-hidden">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '';
                    img.style.display = 'none';
                  }}
                  loading="lazy"
                  width={96}
                  height={96}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 -translate-x-1/2 -translate-y-1/2">
              <ProfilePictureUpload
                onUpload={async (file) => {
                  if (!profile) return { success: false, error: 'No profile found' };
                  
                  try {
                    const formData = new FormData();
                    formData.append('profilePicture', file);
                    
                    // Get the token from local storage
                    const token = localStorage.getItem('token');
                    if (!token) {
                      throw new Error('No authentication token found');
                    }
                    
                    const response = await axios.post(
                      `/api/users/${profile.username}/picture`,
                      formData,
                      {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                          'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true  // Important for sending cookies
                      }
                    );
                    
                    if (response.data?.success) {
                      showToast('Profile picture updated successfully!', 'success');
                      // Update the local state to show the new picture
                      setProfile(prev => ({
                        ...prev!,
                        profilePicture: response.data?.profilePicture || response.data?.url || ''
                      }));
                      return { success: true, imageUrl: response.data?.profilePicture || response.data?.url };
                    } else {
                      throw new Error(response.data?.error || 'Failed to update profile picture');
                    }
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    logger.error('Error uploading profile picture:', { error: errorMessage });
                    return { success: false, error: 'An error occurred while uploading' };
                  }
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold" aria-label="User display name">{profile.displayName}</h2>
            <p className="text-sm text-gray-400" aria-label="User username">@{profile.username}</p>
          </div>
        </div>
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Social Links</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Website</label>
                    <input
                      type="url"
                      name="social.website"
                      value={(formData.socialLinks?.website || '')}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Twitter</label>
                    <input
                      type="url"
                      name="social.twitter"
                      value={(formData.socialLinks?.twitter || '')}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">YouTube</label>
                    <input
                      type="url"
                      name="social.youtube"
                      value={(formData.socialLinks?.youtube || '')}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-center text-gray-400 mb-6" aria-label="User bio">
              {profile.bio || 'I am a funny guy!'}
            </p>
          )}

          <div className="flex justify-end mb-4">
            {!isOwnProfile && (
              <MuiButton
                variant="contained"
                onClick={onFollow}
                loading={false}
                color={isFollowing ? "error" : "primary"}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </MuiButton>
            )}
            {isOwnProfile && (
              <MuiButton
                variant="outlined"
                onClick={() => setIsEditing(!isEditing)}
                startIcon={<EditIcon />}
                color="primary"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </MuiButton>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6" role="list" aria-label="User statistics">
            <div className="flex flex-col items-center" role="listitem">
              <span className="text-3xl font-bold" aria-label="Number of posts">{statsData?.posts}</span>
              <span className="text-sm text-gray-400" aria-label="Posts">Posts</span>
            </div>
            <div className="flex flex-col items-center" role="listitem">
              <span className="text-3xl font-bold" aria-label="Number of followers">{statsData?.followers}</span>
              <span className="text-sm text-gray-400" aria-label="Followers">Followers</span>
            </div>
            <div className="flex flex-col items-center" role="listitem">
              <span className="text-3xl font-bold" aria-label="Number of following">{statsData?.following}</span>
              <span className="text-sm text-gray-400" aria-label="Following">Following</span>
            </div>
          </div>

          {profile.isCreator && (
            <div className="mt-4 text-center">
              <span className="text-blue-400 font-semibold">Creator</span>
            </div>
          )}

          {profile.socialLinks && (
            <div className="flex items-center space-x-4">
              {profile?.socialLinks?.website && (
                <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500">
                  <EditIcon /> Website
                </a>
              )}
              {profile?.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500">
                  <EditIcon /> Twitter
                </a>
              )}
              {profile?.socialLinks?.youtube && (
                <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500">
                  <EditIcon /> YouTube
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;