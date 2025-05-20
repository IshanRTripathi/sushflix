import { User } from '../../../shared/types/user';

export interface ProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
  profilePicture?: string;
  coverPhoto?: string;
}

export interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

export interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onEdit: () => void;
}

export interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
