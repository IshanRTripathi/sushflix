export interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: string;
}

export interface ContentCardProps {
  id: string;
  thumbnail: string;
  creatorProfilePic: string;
  creatorName: string;
  timestamp: string;
  caption: string;
  isSubscribed: boolean;
  onSubscribe: () => Promise<void>;
  onClick: () => void;
  initialLikes: number;
  onComment: (text: string) => void;
  initialLiked: boolean;
  comments: Comment[];
  className?: string;
}
