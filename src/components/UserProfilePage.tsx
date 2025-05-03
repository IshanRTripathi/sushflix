import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfileService } from '../services/userProfileService';
import { UserProfile, EditableProfileFields } from '../types/user';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import './UserProfilePage.css';
import { logger } from '../utils/logger';

export const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<keyof EditableProfileFields | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await UserProfileService.getInstance().getProfileByUsername(username!);
        if (profileData) {
          setProfile(profileData);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load profile');
        logger.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleEditStart = (field: keyof EditableProfileFields, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleEditSave = async () => {
    if (!editingField || !profile) return;

    try {
      const updates: Partial<EditableProfileFields> = {
        [editingField]: editValue
      };

      const updatedProfile = await UserProfileService.getInstance().updateProfile(
        profile.userId,
        updates
      );

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditingField(null);
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to update profile');
      logger.error('Error updating profile:', err);
    }
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const updatedProfile = await UserProfileService.getInstance().updateProfilePicture(
        profile.userId,
        file
      );

      clearInterval(interval);
      setUploadProgress(100);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setSuccessMessage('Profile picture updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to upload profile picture');
      logger.error('Error uploading profile picture:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSocialLinkUpdate = async (platform: keyof UserProfile['socialLinks'], value: string) => {
    if (!profile) return;

    try {
      const updates: Partial<EditableProfileFields> = {
        socialLinks: {
          ...profile.socialLinks,
          [platform]: value
        }
      };

      const updatedProfile = await UserProfileService.getInstance().updateProfile(
        profile.userId,
        updates
      );

      if (updatedProfile) {
        setProfile(updatedProfile);
        setSuccessMessage(`${platform} link updated successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(`Failed to update ${platform} link`);
      logger.error(`Error updating ${platform} link:`, err);
    }
  };

  const isOwner = user?.username === username;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div className="error-message">Profile not found</div>;
  }

  return (
    <div className="profile-container">
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="profile-header">
        <div className="profile-picture-container">
          <img
            src={profile.profilePicture}
            alt={`${profile.displayName}'s profile`}
            className="profile-picture"
          />
          {isOwner && (
            <div className="profile-picture-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="file-input"
              />
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name">
            {editingField === 'displayName' ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="edit-input"
                />
                <button onClick={handleEditSave} className="save-button">Save</button>
                <button onClick={handleEditCancel} className="cancel-button">Cancel</button>
              </div>
            ) : (
              <h1>
                {profile.displayName}
                {isOwner && (
                  <button
                    onClick={() => handleEditStart('displayName', profile.displayName)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                )}
              </h1>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profile.stats.posts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.stats.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.stats.subscribers}</span>
              <span className="stat-label">Subscribers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-bio">
          {editingField === 'bio' ? (
            <div className="edit-field">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-textarea"
              />
              <button onClick={handleEditSave} className="save-button">Save</button>
              <button onClick={handleEditCancel} className="cancel-button">Cancel</button>
            </div>
          ) : (
            <div className="bio-content">
              <p>{profile.bio}</p>
              {isOwner && (
                <button
                  onClick={() => handleEditStart('bio', profile.bio)}
                  className="edit-button"
                >
                  Edit Bio
                </button>
              )}
            </div>
          )}
        </div>

        <div className="social-links">
          <h3>Social Links</h3>
          <div className="social-links-grid">
            {Object.entries(profile.socialLinks).map(([platform, url]) => (
              <div key={platform} className="social-link-item">
                <span className="platform-name">{platform}</span>
                {isOwner ? (
                  <input
                    type="text"
                    value={url || ''}
                    onChange={(e) => handleSocialLinkUpdate(platform as keyof UserProfile['socialLinks'], e.target.value)}
                    className="social-link-input"
                    placeholder={`Enter ${platform} URL`}
                  />
                ) : (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="social-link">
                    {url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 