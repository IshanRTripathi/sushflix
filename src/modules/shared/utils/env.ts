import { z } from 'zod';

// Define the schema for environment variables
export const envSchema = z.object({
  // Node Environment - Required
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  
  // API Configuration - Required
  VITE_API_URL: z.string().url().default('http://localhost:5173'),
  
  // Authentication - Required
  JWT_SECRET: z.string().default('dev-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Database - Required
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/sushflix'),
  
  // AWS S3 - Optional
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  
  // Email - Optional
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().transform(val => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  
  // Security - Optional with defaults
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  CORS_ORIGIN: z.string().default('*'),
  
  // Feature Flags - Optional with defaults
  FEATURE_REGISTRATION: z.string().transform(val => val === 'true').default('true'),
  FEATURE_EMAIL_VERIFICATION: z.string().transform(val => val === 'true').default('false'),
  FEATURE_PASSWORD_RESET: z.string().transform(val => val === 'true').default('true'),
  
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
