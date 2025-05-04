// Production URLs
export const PROD_API_BASE_URL = 'https://sushflix-backend-796527544626.us-central1.run.app/';
export const PROD_FRONTEND_URL = 'https://sushflix-frontend-796527544626.us-central1.run.app/';

// Use Vite's environment variables for local development
export const API_BASE_URL = import.meta.env.VITE_API_URL || PROD_API_BASE_URL;
export const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_URL || PROD_FRONTEND_URL;
