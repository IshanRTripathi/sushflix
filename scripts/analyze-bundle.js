import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const analyzeDirectory = async (dir) => {
  const files = await fs.readdir(dir);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  console.log('\nBundle Analysis Report');
  console.log(''.padEnd(50, '='));
  
  let totalSize = 0;
  const fileSizes = [];
  
  for (const file of jsFiles) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    totalSize += fileSize;
    fileSizes.push({ name: file, size: fileSize });
  }
  
  // Sort by size (descending)
  fileSizes.sort((a, b) => b.size - a.size);
  
  // Display files
  for (const file of fileSizes) {
    const percentage = ((file.size / totalSize) * 100).toFixed(2);
    console.log(`${file.name.padEnd(30)} ${formatBytes(file.size).padStart(12)} (${percentage}%)`);
  }
  
  console.log(''.padEnd(50, '-'));
  console.log(`Total JavaScript size: ${formatBytes(totalSize).padStart(20)} (100%)`);
  
  // Recommendations
  console.log('\nRecommendations:');
  if (totalSize > 500000) { // 500KB
    console.log('⚠️  Bundle size is large. Consider:');
    console.log('   - Implementing code splitting');
    console.log('   - Reviewing large dependencies');
  } else {
    console.log('✅ Bundle size is within reasonable limits');
  }
  
  if (fileSizes.some(f => f.size > 244000)) { // 244KB
    console.log('⚠️  Large individual files detected. Consider:');
    console.log('   - Code splitting large components');
    console.log('   - Lazy loading non-critical components');
  }
  
  console.log('\nNext steps:');
  console.log('1. Review the largest bundles for optimization opportunities');
  console.log('2. Consider lazy loading for routes and components');
  console.log('3. Check for duplicate dependencies');
};

const run = async () => {
  try {
    const distDir = path.join(process.cwd(), 'dist/static');
    console.log(`Analyzing bundles in: ${distDir}\n`);
    await analyzeDirectory(distDir);
  } catch (error) {
    console.error('Error analyzing bundle:', error.message);
    console.error('\nMake sure to run `npm run build` first');
    process.exit(1);
  }
};

run().catch(console.error);
