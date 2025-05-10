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
  initialLikes: number;
  initialLiked: boolean;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onClick: () => void;
  onComment: (text: string) => Promise<void>;
  comments: Comment[];
  className?: string;
}
