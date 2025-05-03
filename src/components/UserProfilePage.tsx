import React, { useState, useEffect } from 'react';
import { UserProfile, EditableProfileFields, SocialLinks } from '../types/user';
import { userProfileService } from '../services/userProfileService';
import { logger } from '../utils/logger';
import LoadingSpinner from '../components/LoadingSpinner';

interface UserProfilePageProps {
  username: string;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ username }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditableProfileFields>({
    displayName: '',
    email: '',
    bio: '',
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await userProfileService.getProfileByUsername(username);
        if (profileData) {
          setProfile(profileData);
          setFormData({
            displayName: profileData.displayName,
            email: profileData.email,
            bio: profileData.bio,
            socialLinks: profileData.socialLinks
          });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1] as keyof SocialLinks;
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const success = await userProfileService.updateProfile(profile.userId, formData);
      if (success) {
        setProfile(prev => prev ? { ...prev, ...formData, lastUpdated: new Date() } : null);
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
      logger.error('Error updating profile:', { error: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile) return;

    const file = e.target.files[0];
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        if (reader.result) {
          const buffer = Buffer.from(reader.result as ArrayBuffer);
          const newPicturePath = await userProfileService.updateProfilePicture(
            profile.userId,
            buffer,
            file.name
          );
          if (newPicturePath) {
            setProfile(prev => prev ? { ...prev, profilePicture: newPicturePath } : null);
            setFormData(prev => ({ ...prev, profilePicture: newPicturePath }));
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Failed to upload profile picture');
      logger.error('Error uploading profile picture:', { error: err instanceof Error ? err.message : String(err) });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        {!isEditing ? (
          <div>
            <div className="flex items-center space-x-4">
              <img
                src={profile.profilePicture}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                <p className="text-gray-600">@{profile.username}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Contact</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Social Links</h2>
              <div className="space-y-2">
                {profile.socialLinks.website && (
                  <a href={profile.socialLinks.website} className="text-blue-600 hover:underline">
                    Website
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a href={profile.socialLinks.twitter} className="text-blue-600 hover:underline">
                    Twitter
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
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
                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mt-1 block w-full"
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
                      value={formData.socialLinks.website || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Twitter</label>
                    <input
                      type="url"
                      name="social.twitter"
                      value={formData.socialLinks.twitter || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">LinkedIn</label>
                    <input
                      type="url"
                      name="social.linkedin"
                      value={formData.socialLinks.linkedin || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage; 