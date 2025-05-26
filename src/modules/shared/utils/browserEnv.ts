import { z } from 'zod';

// Define the shape of our environment variables
const envSchema = {
  // Required
  VITE_API_URL: z.string().url().default('http://localhost:5173'),
  
  // Optional with defaults
  VITE_APP_NAME: z.string().default('SushFlix'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  
  // Feature flags (as strings)
  VITE_ENABLE_ANALYTICS: z.string().default('false'),
  VITE_ENABLE_MAINTENANCE_MODE: z.string().default('false'),
} as const;

type EnvSchema = typeof envSchema;
type ClientEnv = {
  [K in keyof EnvSchema]: z.infer<EnvSchema[K]>;
};

// Parse environment variables
function parseEnv<T extends Record<string, z.ZodTypeAny>>(schema: T, env: Record<string, string | undefined>): z.infer<z.ZodObject<T>> {
  const result: Record<string, unknown> = {};
  
  for (const [key, validator] of Object.entries(schema)) {
    const value = env[key];
    const parsed = validator.safeParse(value);
    
    if (parsed.success) {
      result[key] = parsed.data;
    } else if (import.meta.env.DEV) {
      console.warn(`Invalid value for ${key}:`, value);
    }
  }
  
  return result as z.infer<z.ZodObject<T>>;
}

// Get client environment variables
const getClientEnv = (): ClientEnv => {
  if (typeof window === 'undefined') {
    return {} as ClientEnv;
  }
  
  // Get all VITE_ prefixed env vars
  const clientEnvVars = Object.entries(import.meta.env).reduce<Record<string, string>>((acc, [key, value]) => {
    if (key.startsWith('VITE_')) {
      acc[key] = String(value);
    }
    return acc;
  }, {});
  
  return parseEnv(envSchema, clientEnvVars);
};

// Validate client-side environment variables
export const validateBrowserEnv = (): { valid: boolean; errors?: string[] } => {
  if (typeof window === 'undefined') {
    return { valid: true };
  }

  try {
    // This will throw if required env vars are missing
    getClientEnv();
    
    if (import.meta.env.DEV) {
      console.log('✅ Client environment variables validated');
    }
    
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (import.meta.env.DEV) {
      console.error('❌ Invalid client environment variables:', errorMessage);
    }
    
    return { 
      valid: false, 
      errors: [errorMessage] 
    };
  }
};

// Validate on module load in development
if (import.meta.env.DEV) {
  const { valid, errors } = validateBrowserEnv();
  if (!valid) {
    console.error('❌ Invalid client environment variables:');
    console.error(errors?.join('\n'));
  }
}

// Create and export the typed environment object
export const browserEnv = (() => {
  if (typeof window === 'undefined') {
    return {} as ClientEnv;
  }
  
  const env = getClientEnv();
  
  // In development, validate all required env vars are present
  if (import.meta.env.DEV && !env.VITE_API_URL) {
    console.error('Missing required environment variable: VITE_API_URL');
  }
  
  return env;
})();
