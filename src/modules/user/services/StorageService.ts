import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../shared/utils/logger';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
};

// Initialize multer with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

// Upload file
export const uploadFile = async (username: string, file: UploadedFile): Promise<UploadResponse> => {
  try {
    // Generate a unique filename
    const ext = path.extname(file.originalname);
    const filename = `${username}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Write the file to disk
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Return the URL where the file can be accessed
    const fileUrl = `/uploads/${filename}`;
    
    return {
      success: true,
      fileUrl
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('File upload error:', { error: errorMessage });
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Delete file
export const deleteFile = async (filename: string): Promise<void> => {
  try {
    const fullPath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      logger.warn(`File not found: ${fullPath}`);
      return;
    }

    // Delete file
    await fs.promises.unlink(fullPath);
    logger.info(`File deleted: ${fullPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error deleting file:', { error: errorMessage });
    throw error; // Re-throw to allow controller to handle the error
  }
};

export default {
  upload,
  uploadFile,
  deleteFile
};
