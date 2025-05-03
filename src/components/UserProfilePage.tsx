import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { UserProfileService } from '../services/userProfileService';
import LoadingSpinner from './LoadingSpinner';
import { UserProfile, EditableProfileFields } from '../types/user';
import { logger } from '../utils/logger';
import './UserProfilePage.css';

interface UserProfilePageProps {
  username: string;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ username }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userProfileService = UserProfileService.getInstance();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await userProfileService.getProfileByUsername(username);
        setProfile(profileData);
        setError(null);
      } catch (err) {
        logger.error('Error fetching profile', err, { username });
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleEditStart = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleEditSave = async () => {
    if (!profile || !editingField) return;

    try {
      const updates: EditableProfileFields = {
        [editingField]: editingValue
      };

      const success = await userProfileService.updateProfile(profile.userId, updates);
      if (success) {
        setProfile({
          ...profile,
          [editingField]: editingValue,
          lastUpdated: new Date()
        });
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        logger.info('Profile field updated', { userId: profile.userId, field: editingField });
      } else {
        setError('Failed to update profile');
        logger.warn('Profile update failed', { userId: profile.userId, field: editingField });
      }
    } catch (err) {
      logger.error('Error updating profile', err, { userId: profile.userId, field: editingField });
      setError('Failed to update profile');
    } finally {
      setEditingField(null);
      setEditingValue('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !event.target.files?.[0]) return;

    try {
      const file = event.target.files[0];
      const success = await userProfileService.updateProfilePicture(
        profile.userId,
        await file.arrayBuffer(),
        file.name
      );

      if (success) {
        setProfile({
          ...profile,
          profilePicture: success,
          lastUpdated: new Date()
        });
        setSuccessMessage('Profile picture updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        logger.info('Profile picture updated', { userId: profile.userId });
      } else {
        setError('Failed to update profile picture');
        logger.warn('Profile picture update failed', { userId: profile.userId });
      }
    } catch (err) {
      logger.error('Error updating profile picture', err, { userId: profile.userId });
      setError('Failed to update profile picture');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div className="error-message">Profile not found</div>;
  }

  const isOwner = user?.userId === profile.userId;

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
              <button className="upload-button">Change Picture</button>
            </div>
          )}
        </div>
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{profile.stats.posts}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat">
            <span className="stat-value">{profile.stats.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-value">{profile.stats.subscribers}</span>
            <span className="stat-label">Subscribers</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-field">
            <span className="field-label">Display Name</span>
            {editingField === 'displayName' ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="edit-input"
                />
                <button onClick={handleEditSave} className="save-button">Save</button>
                <button onClick={handleEditCancel} className="cancel-button">Cancel</button>
              </div>
            ) : (
              <div className="field-value">
                <span>{profile.displayName}</span>
                {isOwner && (
                  <button
                    onClick={() => handleEditStart('displayName', profile.displayName)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="profile-field">
            <span className="field-label">Bio</span>
            {editingField === 'bio' ? (
              <div className="edit-field">
                <textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="edit-input"
                />
                <button onClick={handleEditSave} className="save-button">Save</button>
                <button onClick={handleEditCancel} className="cancel-button">Cancel</button>
              </div>
            ) : (
              <div className="field-value">
                <span>{profile.bio}</span>
                {isOwner && (
                  <button
                    onClick={() => handleEditStart('bio', profile.bio)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="social-links">
            <h3>Social Links</h3>
            {Object.entries(profile.socialLinks).map(([platform, url]) => (
              url && (
                <div key={platform} className="social-link">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {platform}
                  </a>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 