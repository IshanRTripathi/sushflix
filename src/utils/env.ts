import { z } from 'zod';

// Define the schema for environment variables
export const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5173'),
  
  // API Configuration
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('SushFlix'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // Database
  MONGODB_URI: z.string().url(),
  MONGODB_TEST_URI: z.string().url().optional(),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_S3_ENDPOINT: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.string().transform(val => val === 'true'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
  
  // Security
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number),
  RATE_LIMIT_MAX: z.string().transform(Number),
  CORS_ORIGIN: z.string(),
  
  // Feature Flags
  FEATURE_REGISTRATION: z.string().transform(val => val === 'true'),
  FEATURE_EMAIL_VERIFICATION: z.string().transform(val => val === 'true'),
  FEATURE_PASSWORD_RESET: z.string().transform(val => val === 'true'),
  
  // Optional Analytics
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),
});

// Helper function to get environment variables
const getEnvVars = () => {
  if (typeof window === 'undefined') {
    // Server-side: Use process.env
    return { ...process.env };
  } else {
    // Client-side: Use import.meta.env
    return { ...import.meta.env };
  }
};

// Validate environment variables
export const validateEnv = () => {
  try {
    // Get environment variables based on the environment
    const envVars = getEnvVars();
    
    // Validate against schema
    const result = envSchema.safeParse(envVars);
    
    if (!result.success) {
      if (typeof window === 'undefined') {
        // Server-side: Log and exit
        console.error('❌ Invalid environment variables:');
        result.error.issues.forEach((issue) => {
          console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        });
        process.exit(1);
      } else {
        // Client-side: Log but don't throw in production
        if (import.meta.env.DEV) {
          console.warn('⚠️ Some environment variables are missing or invalid');
          result.error.issues.forEach((issue) => {
            console.warn(`  - ${issue.path.join('.')}: ${issue.message}`);
          });
        }
        // Return null for client-side to prevent runtime errors
        return null;
      }
    }
    
    if (typeof window === 'undefined') {
      console.log('✅ Environment variables validated successfully');
    }
    
    return result.data;
  } catch (error) {
    if (typeof window === 'undefined') {
      console.error('❌ Failed to validate environment variables:', error);
      process.exit(1);
    } else {
      console.error('❌ Failed to validate environment variables in browser:', error);
      return null;
    }
  }
};

// Export validated environment variables
export const env = validateEnv();

// Export types
export type EnvVariables = z.infer<typeof envSchema>;
