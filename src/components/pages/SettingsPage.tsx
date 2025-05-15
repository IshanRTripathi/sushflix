import { useAuth } from '../auth/AuthContext';
import { Container, Typography, Box, Button, List, ListItem, ListItemText, ListItemIcon, Divider, Paper, styled, ListItemButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
  AccountCircle,
  Lock,
  Notifications,
  PrivacyTip,
  Logout,
} from '@mui/icons-material';
import { ThemeSettings } from '../settings/ThemeSettings';

const StyledGrid = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const muiTheme = useMuiTheme();

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <StyledContainer>
        {/* Sidebar */}
        <StyledGrid sx={{ flex: { xs: '0 0 100%', md: '0 0 75%' } }}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton selected>
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  <ListItemText primary="Account" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Lock /></ListItemIcon>
                  <ListItemText primary="Privacy" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Notifications /></ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><PrivacyTip /></ListItemIcon>
                  <ListItemText primary="Security" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </StyledGrid>

        {/* Main Content */}
        <StyledGrid sx={{ flex: { xs: '0 0 100%', md: '0 0 75%' } }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
            {/* Account Info */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Grid container spacing={2}>
                  <Typography variant="subtitle1">Username</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.username}
                  </Typography>
                  <Typography variant="subtitle1">Email</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.email}
                  </Typography>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Appearance */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <ThemeSettings />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Logout */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Account Actions
              </Typography>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleLogout}
                startIcon={<Logout />}
                sx={{ mt: 2, '&:hover': { backgroundColor: muiTheme.palette.error.dark } }}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </StyledGrid>
      </StyledContainer>
    </Container>
  );
};

export default SettingsPage;
