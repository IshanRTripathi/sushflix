import React, { useState } from 'react';
import { Box, TextField, Typography, Card, CardContent, Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { useToast } from '@/hooks/useToast';
import { LoadingButton } from '@mui/lab';

interface EditProfileProps {
  user: any;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const EditProfile: React.FC<EditProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const { setLoadingState } = useLoadingState();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    bio: user.bio || '',
    website: user.socialLinks?.website || '',
    twitter: user.socialLinks?.twitter || '',
    linkedin: user.socialLinks?.linkedin || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState({ isLoading: true });
    try {
      // TODO: Implement actual API call to update profile
      // For now, just show success toast
      showToast('Profile updated successfully', 'success');
      navigate(-1);
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoadingState({ isLoading: false });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Edit Profile
      </Typography>
      <StyledCard>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              multiline
              rows={4}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="LinkedIn"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={false}
              >
                Save Changes
              </LoadingButton>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default EditProfile;
