import React from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
}) => {
  const baseStyles = 'bg-black rounded-lg overflow-hidden';
  const variantStyles = {
    default: 'shadow-sm',
    elevated: 'shadow-lg',
    bordered: 'border border-gray-800',
  }[variant];

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`}>{children}</div>
  );
};

export default Card;
