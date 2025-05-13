// Test ES modules support
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('ES Modules are working!');
console.log('Current file:', __filename);
console.log('Current directory:', __dirname);
