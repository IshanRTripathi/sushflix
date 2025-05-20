import React from 'react';
import { Box, TextField, Typography, Card, CardContent, styled, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ProfileFormData, ProfileErrors } from '../types';

interface ProfileFormUIProps {
  formData: ProfileFormData;
  errors: ProfileErrors;
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreatorToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

/**
 * Reusable UI component for the profile form
 */
export const ProfileFormUI: React.FC<ProfileFormUIProps> = ({
  formData,
  errors,
  loading,
  onInputChange,
  onCreatorToggle,
  onSubmit
}) => {
  return (
    <Box>
      <form onSubmit={onSubmit}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={formData.displayName}
                onChange={onInputChange}
                error={!!errors.displayName}
                helperText={errors.displayName}
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={onInputChange}
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
                onChange={onInputChange}
                error={!!errors.website}
                helperText={errors.website}
              />
              <TextField
                fullWidth
                label="Twitter"
                name="twitter"
                value={formData.twitter}
                onChange={onInputChange}
                error={!!errors.twitter}
                helperText={errors.twitter}
              />
              <TextField
                fullWidth
                label="YouTube"
                name="youtube"
                value={formData.youtube}
                onChange={onInputChange}
                error={!!errors.youtube}
                helperText={errors.youtube}
              />
              <FormControl fullWidth>
                <InputLabel>Creator Status</InputLabel>
                <Select
                  value={formData.isCreator ? 'creator' : 'user'}
                  onChange={onCreatorToggle}
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
