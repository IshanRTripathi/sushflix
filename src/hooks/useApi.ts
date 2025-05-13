import { useState, useCallback, useRef } from 'react';

/**
 * Represents the API response structure
 * @template T - The expected data type in the response
 */
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status?: number;
}

/**
 * Configuration options for the API request
 * @template T - The expected response data type
 * @template U - The request body type (optional)
 */
interface ApiRequestOptions<U = unknown> {
  body?: U;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Hook for making API requests with TypeScript support
 * @template T - The expected response data type
 * @template U - The request body type (optional)
 * @param {string} baseUrl - The base URL for the API
 * @returns An object containing the request function and response state
 */
export function useApi<T, U = unknown>(baseUrl: string) {
  const [response, setResponse] = useState<ApiResponse<T>>({ 
    data: null, 
    error: null,
    status: undefined
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Makes an API request
   * @param {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} method - The HTTP method
   * @param {string} endpoint - The API endpoint (appended to baseUrl)
   * @param {ApiRequestOptions<U>} [options] - Additional request options
   * @returns {Promise<ApiResponse<T>>} The API response
   */
  const makeRequest = useCallback(async (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options: ApiRequestOptions<U> = {}
  ): Promise<ApiResponse<T>> => {
    // Cancel any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const { body, headers = {} } = options;
    const url = `${baseUrl}${endpoint}`;
    
    try {
      setIsLoading(true);
      setResponse(prev => ({ ...prev, error: null }));

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = responseData.message || `Request failed with status ${response.status}`;
        const errorResponse: ApiResponse<T> = { 
          data: null, 
          error: errorMessage,
          status: response.status
        };
        setResponse(errorResponse);
        return errorResponse;
      }

      const successResponse: ApiResponse<T> = { 
        data: responseData as T, 
        error: null,
        status: response.status
      };
      setResponse(successResponse);
      return successResponse;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.name === 'AbortError' 
          ? 'Request was cancelled' 
          : error.message
        : 'An unknown error occurred';
      
      const errorResponse: ApiResponse<T> = { 
        data: null, 
        error: errorMessage,
        status: error instanceof Response ? error.status : undefined
      };
      
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error(`[useApi] ${method} ${url} failed:`, error);
      }
      
      setResponse(errorResponse);
      return errorResponse;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  }, [baseUrl]);

  /**
   * Cancels any in-progress request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { 
    /** The current response state */
    response, 
    /** Whether a request is currently in progress */
    isLoading, 
    /** Function to make a GET request */
    get: useCallback((endpoint: string, options?: Omit<ApiRequestOptions<U>, 'body'>) => 
      makeRequest('GET', endpoint, options), [makeRequest]),
    /** Function to make a POST request */
    post: useCallback((endpoint: string, options?: ApiRequestOptions<U>) => 
      makeRequest('POST', endpoint, options), [makeRequest]),
    /** Function to make a PUT request */
    put: useCallback((endpoint: string, options?: ApiRequestOptions<U>) => 
      makeRequest('PUT', endpoint, options), [makeRequest]),
    /** Function to make a PATCH request */
    patch: useCallback((endpoint: string, options?: ApiRequestOptions<U>) => 
      makeRequest('PATCH', endpoint, options), [makeRequest]),
    /** Function to make a DELETE request */
    del: useCallback((endpoint: string, options?: Omit<ApiRequestOptions<U>, 'body'>) => 
      makeRequest('DELETE', endpoint, options), [makeRequest]),
    /** Function to cancel the current request */
    cancelRequest,
  };
}