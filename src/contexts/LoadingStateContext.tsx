import React, { createContext, useContext, useState, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error?: Error;
}

interface LoadingStateContextType {
  loadingState: LoadingState;
  setLoadingState: (state: LoadingState) => void;
}

const LoadingStateContext = createContext<LoadingStateContextType | undefined>(undefined);

export const LoadingStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });

  return (
    <LoadingStateContext.Provider value={{ loadingState, setLoadingState }}>
      {children}
    </LoadingStateContext.Provider>
  );
};

export const useLoadingState = () => {
  const context = useContext(LoadingStateContext);
  if (context === undefined) {
    throw new Error('useLoadingState must be used within a LoadingStateProvider');
  }
  return context;
};

export default LoadingStateContext;
