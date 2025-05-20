/**
 * Base URL for API requests.
 * Falls back to production backend URL if VITE_API_URL is not set in environment variables.
 * @constant {string}
 */
export const API_BASE_URL: string = 
  (import.meta.env.VITE_API_URL as string) || 
  'https://sushflix-backend-796527544626.us-central1.run.app';

/**
 * API endpoint paths for the application.
 * These are relative to the API_BASE_URL.
 * @constant {Object.<string, string>}
 */
export const API_ENDPOINTS = {
  /** Endpoint for user login */
  LOGIN: 'login',
  /** Endpoint for user registration */
  SIGNUP: 'signup',
  /** Endpoint for fetching current user profile */
  PROFILE: 'me'
} as const;

/**
 * Type representing valid API endpoint keys
 */
export type ApiEndpointKey = keyof typeof API_ENDPOINTS;

/**
 * Gets the full URL for an API endpoint.
 * @param {ApiEndpointKey} endpoint - The endpoint key from API_ENDPOINTS
 * @param {string} [baseUrl=API_BASE_URL] - Optional base URL (defaults to API_BASE_URL)
 * @returns {string} The full URL
 * @throws {Error} If the endpoint doesn't exist
 * @example
 * // Returns 'https://api.example.com/login'
 * getApiUrl('LOGIN');
 */
export function getApiUrl(endpoint: ApiEndpointKey, baseUrl: string = API_BASE_URL): string {
  if (!(endpoint in API_ENDPOINTS)) {
    throw new Error(`Invalid API endpoint: ${endpoint}`);
  }
  
  // Ensure baseUrl doesn't end with a slash
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}/${API_ENDPOINTS[endpoint]}`;
}
