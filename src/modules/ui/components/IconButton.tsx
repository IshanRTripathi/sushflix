import React from 'react';
import { styled } from '@mui/material/styles';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  active?: boolean;
  count?: number;
}

const StyledButton = styled('button')<{ active?: boolean }>(({ theme, active }) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '8px',
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  '&:hover': {
    opacity: 0.8,
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

const Count = styled('span')(() => ({
  marginLeft: '6px',
  fontSize: '0.875rem',
  color: 'inherit',
}));

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  active = false,
  count,
  ...props
}) => (
  <StyledButton active={active} {...props}>
    {children}
    {count !== undefined && <Count>{count}</Count>}
  </StyledButton>
);
