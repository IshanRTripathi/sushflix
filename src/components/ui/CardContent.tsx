import React from 'react';

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};
