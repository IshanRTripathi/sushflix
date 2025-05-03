const fs = require('fs').promises;
const path = require('path');

async function createLogsDir() {
  try {
    const logsDir = path.join(__dirname, '../logs');
    await fs.mkdir(logsDir, { recursive: true });
    console.log('Logs directory created successfully');
  } catch (error) {
    console.error('Error creating logs directory:', error);
    process.exit(1);
  }
}

createLogsDir(); 