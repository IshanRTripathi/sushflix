import { useState } from 'react';

export interface Toast {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export interface UseToastReturn {
  toast: Toast | null;
  showToast: (message: string, severity: Toast['severity']) => void;
}

export const useToast = (): UseToastReturn => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, severity: Toast['severity']) => {
    setToast({ message, severity });
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  return { toast, showToast };
};
