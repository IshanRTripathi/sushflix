import { useState } from 'react';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export function useApi<T>(route: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE') {
  const [response, setResponse] = useState<ApiResponse<T>>({ data: null, error: null });

  const makeRequest = async (body?: any) => {
    try {
      const res = await fetch(route, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setResponse({ data: null, error: errorData.message || 'Request failed' });
        return;
      }
      const data = await res.json();
      setResponse({ data, error: null });
      return;
    } catch (error: unknown) {
      setResponse({ data: null, error: error instanceof Error ? error.message : 'An error occurred' });
      return;
    }
  };

  return { makeRequest, response };
}