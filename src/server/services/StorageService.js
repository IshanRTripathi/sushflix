const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Store a file to disk
async function storeFile(file) {
  await ensureUploadDir();
  
  // Generate unique filename
  const fileName = `${uuidv4()}-${file.originalname}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Save file
  await fs.writeFile(filePath, file.buffer);

  // Return public URL
  return `/uploads/${fileName}`;
}

// Delete a file from disk
async function deleteFile(filePath) {
  try {
    const fullFilePath = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));
    await fs.unlink(fullFilePath);
    return true;
  } catch (error) {
    return false;
  }
}

class StorageService {
  static instance = null;

  static getInstance() {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async storeFile(file) {
    return storeFile(file);
  }

  async deleteFile(filePath) {
    return deleteFile(filePath);
  }
}

module.exports = StorageService;
