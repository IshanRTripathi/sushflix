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
  profilePicture: string;
  creatorName: string;
  timestamp: string;
  caption: string;
  isSubscribed: boolean;
  onSubscribe: () => Promise<void>;
  onClick: () => void;
  initialLikes: number;
  onComment: (text: string) => Promise<void>;
  initialLiked: boolean;
  comments: Comment[];
  className?: string;
}
