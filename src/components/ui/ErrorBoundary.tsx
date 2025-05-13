import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A simple error boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI when an error occurs.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Error caught in ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold text-lg mb-2">Something went wrong</h3>
          <p className="text-sm mb-2">
            Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={this.handleReset}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
          {process.env['NODE_ENV'] === 'development' && error && (
            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
