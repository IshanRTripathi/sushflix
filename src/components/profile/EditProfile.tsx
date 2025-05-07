import React, { useState } from 'react';
import { Box, TextField, Typography, Card, CardContent, styled, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { LoadingButton } from '@mui/lab';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';

interface EditProfileProps {
  user: any;
  onProfileUpdate?: () => void;
}

interface ProfileFormData {
  displayName: string;
  bio: string;
  website: string;
  twitter: string;
  linkedin: string;
  isCreator: boolean;
}

interface ProfileErrors {
  displayName: string;
  bio: string;
  website: string;
  twitter: string;
  linkedin: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const EditProfile: React.FC<EditProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: user.displayName || '',
    bio: user.bio || '',
    website: user.socialLinks?.website || '',
    twitter: user.socialLinks?.twitter || '',
    linkedin: user.socialLinks?.linkedin || '',
    isCreator: user.isCreator || false
  });

  const [errors, setErrors] = useState<ProfileErrors>({
    displayName: '',
    bio: '',
    website: '',
    twitter: '',
    linkedin: ''
  });

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {
      displayName: formData.displayName.trim() ? '' : 'Display name is required',
      bio: formData.bio.length > 500 ? 'Bio must be less than 500 characters' : '',
      website: formData.website && !/^https?:\/\/.+/i.test(formData.website) ? 'Invalid website URL' : '',
      twitter: formData.twitter && !/^https?:\/\/.+/i.test(formData.twitter) ? 'Invalid Twitter URL' : '',
      linkedin: formData.linkedin && !/^https?:\/\/.+/i.test(formData.linkedin) ? 'Invalid LinkedIn URL' : ''
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreatorToggle = (event: SelectChangeEvent<'user' | 'creator'>) => {
    setFormData(prev => ({
      ...prev,
      isCreator: event.target.value === 'creator',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const profileService = ProfileService.getInstance();
      await profileService.updateProfile(user.username, {
        displayName: formData.displayName,
        bio: formData.bio,
        socialLinks: {
          website: formData.website,
          twitter: formData.twitter,
          linkedin: formData.linkedin
        },
        isCreator: formData.isCreator
      });

      logger.info('Profile updated successfully', { userId: user.username });
      showToast('Profile updated successfully', 'success');
      
      navigate(-1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      logger.error('Profile update failed', { error });
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Edit Profile
      </Typography>
      <form onSubmit={handleSubmit}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                error={!!errors.displayName}
                helperText={errors.displayName}
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                multiline
                rows={4}
                error={!!errors.bio}
                helperText={errors.bio}
              />
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                error={!!errors.website}
                helperText={errors.website}
              />
              <TextField
                fullWidth
                label="Twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                error={!!errors.twitter}
                helperText={errors.twitter}
              />
              <TextField
                fullWidth
                label="LinkedIn"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                error={!!errors.linkedin}
                helperText={errors.linkedin}
              />
              <FormControl fullWidth>
                <InputLabel>Creator Status</InputLabel>
                <Select
                  value={formData.isCreator ? 'creator' : 'user'}
                  onChange={handleCreatorToggle}
                  label="Creator Status"
                >
                  <MenuItem value="user">Regular User</MenuItem>
                  <MenuItem value="creator">Creator</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </StyledCard>
        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
          loading={loading}
        >
          Save Changes
        </LoadingButton>
      </form>
    </Box>
  );
};

export default EditProfile;
