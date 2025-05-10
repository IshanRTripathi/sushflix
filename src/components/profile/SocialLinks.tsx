import React from 'react';
import { Box, Typography, Link, Card, CardContent, styled } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

interface SocialLinksProps {
  socialLinks: {
    website?: string;
    twitter?: string;
    youtube?: string;
  };
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SocialLinks: React.FC<SocialLinksProps> = ({ socialLinks }) => {
  const renderSocialLink = (label: string, url: string | undefined) => {
    if (!url) return null;
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer" display="flex" alignItems="center" gap={1}>
        {label}
        <OpenInNew fontSize="small" />
      </Link>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Social Links
      </Typography>
      <StyledCard>
        <CardContent>
          {renderSocialLink('Website', socialLinks.website)}
          {renderSocialLink('Twitter', socialLinks.twitter)}
          {renderSocialLink('YouTube', socialLinks.youtube)}
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default SocialLinks;
