import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Grid as MuiGrid } from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

interface StatsSectionProps {
  user: any;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const StatsSection: React.FC<StatsSectionProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stats
      </Typography>
      <MuiGrid container spacing={2}>
        <MuiGrid xs={12} sm={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" component="div">
                {user.followers}
              </Typography>
              <Typography color="text.secondary">
                Followers
              </Typography>
            </CardContent>
          </StyledCard>
        </MuiGrid>
        <MuiGrid xs={12} sm={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" component="div">
                {user.following}
              </Typography>
              <Typography color="text.secondary">
                Following
              </Typography>
            </CardContent>
          </StyledCard>
        </MuiGrid>
        <MuiGrid xs={12} sm={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" component="div">
                {user.posts}
              </Typography>
              <Typography color="text.secondary">
                Posts
              </Typography>
            </CardContent>
          </StyledCard>
        </MuiGrid>
      </MuiGrid>
    </Box>
  );
};

export default StatsSection;
