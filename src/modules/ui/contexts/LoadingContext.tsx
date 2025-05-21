import { ReactNode, createContext, useContext } from 'react';
import { useLoading, UseLoadingOptions } from '../../shared/hooks/useLoading';

interface LoadingContextType extends ReturnType<typeof useLoading> {
  /** @deprecated Use isLoading from the hook directly */
  loadingState?: {
    isLoading: boolean;
    error: Error | null;
  };
  /** @deprecated Use setLoadingState instead */
  setLoadingState?: (state: { isLoading: boolean; error?: Error | null }) => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider = ({
  children,
  ...options
}: { children: ReactNode } & UseLoadingOptions) => {
  const loading = useLoading(options);

  // For backward compatibility with LoadingStateContext
  const contextValue: LoadingContextType = {
    ...loading,
    loadingState: {
      isLoading: loading.isLoading,
      error: loading.error,
    },
    setLoadingState: (state) => {
      if (state.isLoading) {
        loading.startLoading();
      } else {
        loading.stopLoading(undefined, state.error || null);
      }
    },
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};

// For backward compatibility
export const useLoadingState = () => {
  const { loadingState, setLoadingState } = useLoadingContext();
  return { loadingState, setLoadingState };
};

export default LoadingContext;
