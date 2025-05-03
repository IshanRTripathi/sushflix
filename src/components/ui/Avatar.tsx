import React from 'react';

interface AvatarProps {
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  size = 'md',
  className = '',
  alt = 'User avatar',
}) => {
  const sizeStyles = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  return (
    <img
      src={src || '/default-avatar.png'}
      alt={alt}
      className={`${sizeStyles} rounded-full object-cover ${className}`}
    />
  );
};

export default Avatar;
