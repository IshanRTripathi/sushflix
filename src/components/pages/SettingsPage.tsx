import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Container, Typography, Box, Button, Switch } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Account
        </Typography>
        <Typography variant="body1">
          Username: {user.username}
        </Typography>
        <Typography variant="body1">
          Email: {user.email}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Theme
        </Typography>
        <Switch
          checked={theme === 'dark'}
          onChange={toggleTheme}
          color="primary"
          name="theme"
        />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Dark Mode
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={handleLogout}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default SettingsPage;
