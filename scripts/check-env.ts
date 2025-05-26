import * as dotenv from 'dotenv';
import * as path from 'path';
import { envSchema } from '../src/modules/shared/utils/env';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

console.log('\n=== Environment Variables Check ===');
console.log(`Loading from: ${envPath}\n`);

// Check required environment variables
console.log('Checking required environment variables:');

try {
  // Validate environment variables against the schema
  const parsedEnv = envSchema.safeParse(process.env);
  
  if (!parsedEnv.success) {
    console.error('❌ Environment validation failed:');
    parsedEnv.error.issues.forEach(issue => {
      console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  // If we get here, all required variables are present
  console.log('✅ All required environment variables are present and valid');
  
  // Log some important variables (without sensitive data)
  console.log('\nImportant environment variables:');
  const env = parsedEnv.data;
  console.log(`- NODE_ENV: ${env.NODE_ENV}`);
  console.log(`- VITE_API_URL: ${env.VITE_API_URL}`);
  console.log(`- MONGODB_URI: ${env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
  console.log(`- JWT_SECRET: ${env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
  
  // Check if we're running in development mode
  if (env.NODE_ENV === 'development') {
    console.log('\nDevelopment mode detected:');
    console.log('- Make sure your backend server is running');
    console.log(`- API requests will be proxied to: ${env.VITE_API_URL}`);
  }
  
} catch (error) {
  console.error('❌ Error checking environment variables:');
  console.error(error);
  process.exit(1);
}

console.log('\n=== Environment Check Complete ===\n');
