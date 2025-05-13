import { useState, useCallback, useMemo } from 'react';

type LoadingState = {
  /** Whether the loading state is active */
  isLoading: boolean;
  /** Error that occurred during loading, if any */
  error: Error | null;
  /** Timestamp when loading started */
  startTime: number | null;
  /** Timestamp when loading completed */
  endTime: number | null;
};

type LoadingStates = Record<string, LoadingState>;

interface UseLoadingOptions {
  /** Whether to track loading time (default: true) */
  trackTime?: boolean;
  /** Whether to reset error when starting a new loading state (default: true) */
  resetErrorOnStart?: boolean;
  /** Initial loading states */
  initialStates?: LoadingStates;
}

/**
 * A custom hook to manage loading states with support for multiple loading states,
 * error handling, and loading time tracking.
 * 
 * @template T - The type of the loading state IDs (defaults to string)
 * @param {UseLoadingOptions} [options] - Configuration options
 * @returns Loading state management functions and state
 * 
 * @example
 * // Basic usage
 * const { isLoading, startLoading, stopLoading } = useLoading();
 * 
 * @example
 * // With multiple loading states
 * const {
 *   isLoading: isUserLoading,
 *   startLoading: startUserLoading,
 *   stopLoading: stopUserLoading,
 *   error: userError
 * } = useLoading({ id: 'user' });
 * 
 * @example
 * // With async operation
 * const { wrapAsync, isLoading } = useLoading();
 * 
 * const fetchData = wrapAsync(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 * 
 * // Later in your component
 * const handleClick = async () => {
 *   try {
 *     const data = await fetchData();
 *     console.log('Data loaded:', data);
 *   } catch (error) {
 *     console.error('Failed to load data:', error);
 *   }
 * };
 */
export function useLoading<T extends string = string>(options: UseLoadingOptions = {}) {
  const {
    trackTime = true,
    resetErrorOnStart = true,
    initialStates = {},
  } = options;

  const [loadingStates, setLoadingStates] = useState<Record<T, LoadingState>>(
    () => ({
      default: {
        isLoading: false,
        error: null,
        startTime: null,
        endTime: null,
      },
      ...initialStates,
    } as Record<T, LoadingState>)
  );

  /**
   * Starts a loading state
   * @param id - The ID of the loading state (defaults to 'default')
   */
  const startLoading = useCallback((id: T = 'default' as T) => {
    setLoadingStates((prev) => ({
      ...prev,
      [id]: {
        isLoading: true,
        error: resetErrorOnStart ? null : prev[id]?.error || null,
        startTime: trackTime ? Date.now() : null,
        endTime: null,
      },
    }));
  }, [resetErrorOnStart, trackTime]);

  /**
   * Stops a loading state
   * @param id - The ID of the loading state (defaults to 'default')
   * @param error - Optional error to set when stopping
   */
  const stopLoading = useCallback((id: T = 'default' as T, error: Error | null = null) => {
    setLoadingStates((prev) => {
      const currentState = prev[id] || {};
      return {
        ...prev,
        [id]: {
          isLoading: false,
          error: error || currentState.error,
          startTime: currentState.startTime,
          endTime: trackTime ? Date.now() : null,
        },
      };
    });
  }, [trackTime]);

  /**
   * Wraps an async function with loading state management
   * @param asyncFn - The async function to wrap
   * @param id - The ID of the loading state (defaults to 'default')
   * @returns A function that when called will execute the async function with loading state management
   */
  const wrapAsync = useCallback(<TArgs extends any[], TResult>(
    asyncFn: (...args: TArgs) => Promise<TResult>,
    id: T = 'default' as T
  ) => {
    return async (...args: TArgs): Promise<TResult> => {
      startLoading(id);
      try {
        const result = await asyncFn(...args);
        stopLoading(id);
        return result;
      } catch (error) {
        stopLoading(id, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };
  }, [startLoading, stopLoading]);

  /**
   * Gets the loading state for a specific ID
   * @param id - The ID of the loading state (defaults to 'default')
   * @returns The loading state for the specified ID
   */
  const getLoadingState = useCallback((id: T = 'default' as T): LoadingState => {
    return loadingStates[id] || {
      isLoading: false,
      error: null,
      startTime: null,
      endTime: null,
    };
  }, [loadingStates]);

  /**
   * Gets the loading time for a specific ID in milliseconds
   * @param id - The ID of the loading state (defaults to 'default')
   * @returns The loading time in milliseconds, or null if not applicable
   */
  const getLoadingTime = useCallback((id: T = 'default' as T): number | null => {
    const state = getLoadingState(id);
    if (!state.startTime) return null;
    const endTime = state.endTime || Date.now();
    return endTime - state.startTime;
  }, [getLoadingState]);

  /**
   * Resets a loading state to its initial values
   * @param id - The ID of the loading state to reset (defaults to 'default')
   */
  const resetLoadingState = useCallback((id: T = 'default' as T) => {
    setLoadingStates((prev) => ({
      ...prev,
      [id]: {
        isLoading: false,
        error: null,
        startTime: null,
        endTime: null,
      },
    }));
  }, []);

  // Memoize the default loading state for backward compatibility
  const defaultState = useMemo(() => getLoadingState('default' as T), [getLoadingState]);

  return {
    // Default state (for backward compatibility)
    isLoading: defaultState.isLoading,
    error: defaultState.error,
    loadingTime: getLoadingTime('default' as T),
    
    // State management functions
    loadingStates,
    getLoadingState,
    getLoadingTime,
    startLoading: useCallback((id: T = 'default' as T) => startLoading(id), [startLoading]),
    stopLoading: useCallback((id: T = 'default' as T, error: Error | null = null) => stopLoading(id, error), [stopLoading]),
    resetLoadingState,
    wrapAsync,
    
    // Aliases for common operations
    setLoading: useCallback((id: T = 'default' as T) => startLoading(id), [startLoading]),
    setNotLoading: useCallback((id: T = 'default' as T, error: Error | null = null) => stopLoading(id, error), [stopLoading]),
    setError: useCallback((error: Error, id: T = 'default' as T) => {
      stopLoading(id, error);
    }, [stopLoading]),
  };
}