import React, { Component } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    logger.error('ErrorBoundary caught an error:', {error});
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    logger.error('Error caught in ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold text-lg mb-2">Something went wrong</h3>
          <p className="text-sm">Please try refreshing the page or contact support if the problem persists.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 p-2 bg-red-100 rounded text-xs">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
