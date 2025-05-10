import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import {Grid} from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

interface PostsGridProps {
  posts: Post[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const PostsGrid: React.FC<PostsGridProps> = ({ posts }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Posts
      </Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <StyledCard>
              {post.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl}
                  alt={post.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PostsGrid;
