// Content card component with enhanced user interaction and error handling
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { logger } from '../../../utils/logger';
import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ContentCardProps } from './types';
import { IconButton } from '@/modules/ui/components/IconButton';
import { Icons } from '@/modules/ui/components/icons';
// Comment type is defined in the types file

/**
 * Content card component with enhanced user interaction and error handling
 * @param props - ContentCardProps
 * @returns ReactNode
 */
// Styled components with theme access
const StyledCard = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto 24px',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  overflow: 'hidden',
}));

const CardHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const UserInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

const Avatar = styled('div')({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const Username = styled('span')(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  fontSize: '14px',
}));

const FollowButton = styled('button')(({ theme }) => ({
  color: theme.palette.primary.main,
  background: 'transparent',
  border: 'none',
  fontWeight: 600,
  fontSize: '12px',
  cursor: 'pointer',
  padding: '5px 9px',
  '&:hover': {
    opacity: 0.8,
  },
}));

const PostImage = styled('div')({
  width: '100%',
  paddingBottom: '100%',
  position: 'relative',
  '& img': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const ActionButtons = styled('div')({
  display: 'flex',
  padding: '8px 16px',
  gap: '8px',
  borderBottom: (props: any) => `1px solid ${props.theme.palette.divider}`,
});

const ActionButtonGroup = styled('div')({
  display: 'flex',
  gap: '8px',
  flex: 1,
});

const LikesCount = styled('div')(({ theme }) => ({
  fontWeight: 600,
  fontSize: '14px',
  padding: '0 16px',
  margin: '8px 0',
  color: theme.palette.text.primary,
}));

const Caption = styled('div')(({ theme }) => ({
  padding: '0 16px 8px',
  fontSize: '14px',
  lineHeight: 1.4,
  color: theme.palette.text.primary,
  '& span': {
    fontWeight: 600,
    marginRight: '4px',
  },
}));

const CommentsSection = styled('div')(({ theme }) => ({
  padding: '0 16px 8px',
  fontSize: '14px',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
}));

export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  thumbnail,
  creatorProfilePic,
  creatorName,
  caption,
  isSubscribed,
  onSubscribe,
  onClick,
  initialLikes,
  initialLiked,
  comments,
  className = '',
}) => {

  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.username === creatorName;

  const handleLike = useCallback(async () => {
    if (!user) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLiked) {
        await fetch(`/api/content/${id}/unlike`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setIsLiked(false);
        setLikes((prev: number) => prev - 1);
      } else {
        await fetch(`/api/content/${id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setIsLiked(true);
        setLikes((prev: number) => prev + 1);
      }

      logger.info('Content like/unlike successful', { 
        contentId: id,
        userId: user.userId,
        liked: !isLiked
      });
    } catch (error) {
      logger.error('Failed to like/unlike content', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentId: id
      });
      setIsLoading(false);
    }
  }, [id, isLiked, user, navigate]);

  const toggleComments = useCallback(() => {
    setShowComments(!showComments);
  }, [showComments]);

  // Share and Bookmark handlers are available in ContentCardActions
  // and will be implemented when the corresponding API endpoints are ready

  if (isLoading) {
    return (
      <div className={`flex flex-col gap-4 p-4 rounded-lg bg-white shadow-md ${className}`} role="article" aria-label="Content card">
        <Skeleton variant="circular" width={40} height={40} className="mb-2" />
        <Skeleton variant="rectangular" height={200} className="mb-2" />
        <Skeleton variant="text" width={100} className="mb-2" />
        <Skeleton variant="text" width="80%" className="mb-2" />
      </div>
    );
  }

  return (
    <StyledCard className={`content-card ${className}`} data-testid="content-card">
      {/* Header with user info and follow button */}
      <CardHeader>
        <UserInfo>
          <Avatar>
            <img src={creatorProfilePic || '/default-avatar.png'} alt={creatorName} />
          </Avatar>
          <Username>{creatorName}</Username>
        </UserInfo>
        {!isOwner && (
          <FollowButton onClick={onSubscribe}>
            {isSubscribed ? 'Following' : 'Follow'}
          </FollowButton>
        )}
      </CardHeader>

      {/* Post image */}
      <PostImage>
        <img 
          src={thumbnail} 
          alt={caption || 'Post content'} 
          onClick={onClick}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.png';
          }}
        />
      </PostImage>

      {/* Action buttons */}
      <ActionButtons>
        <ActionButtonGroup>
          <IconButton 
            onClick={handleLike} 
            disabled={isLoading}
            active={isLiked}
          >
            {isLiked ? <Icons.HeartFilled /> : <Icons.Heart />}
          </IconButton>
          <IconButton 
            onClick={toggleComments} 
            disabled={isLoading}
          >
            <Icons.MessageCircle />
          </IconButton>
          <IconButton disabled={isLoading}>
            <Icons.Share />
          </IconButton>
        </ActionButtonGroup>
        <IconButton disabled={isLoading}>
          <Icons.Bookmark />
        </IconButton>
      </ActionButtons>

      {/* Likes count */}
      <LikesCount>{likes.toLocaleString()} likes</LikesCount>

      {/* Caption */}
      <Caption>
        <span>{creatorName}</span>
        {caption}
      </Caption>

      {/* Comments section */}
      {showComments && comments && comments.length > 0 && (
        <CommentsSection>
          View all {comments.length} comments
        </CommentsSection>
      )}
    </StyledCard>
  );
};