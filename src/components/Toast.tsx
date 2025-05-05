import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useToast } from '../hooks/useToast';

const Toast: React.FC = () => {
  const { toast } = useToast();

  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert severity={toast?.severity}>
        {toast?.message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
