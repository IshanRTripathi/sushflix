const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../shared/config/logger');

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const USE_GCS = process.env.USE_GCS === 'true';

let storage, bucket;

if (USE_GCS) {
  try {
    // Initialize Google Cloud Storage client if GCS is enabled
    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE_PATH
    });
    const bucketName = process.env.GCS_BUCKET_NAME || 'user-profile-pictures-sushflix';
    bucket = storage.bucket(bucketName);
    logger.info('Google Cloud Storage initialized with bucket:', { bucket: bucketName });
  } catch (error) {
    logger.error('Failed to initialize Google Cloud Storage:', error);
    throw new Error('Failed to initialize Google Cloud Storage');
  }
} else {
  // Ensure uploads directory exists for local storage
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  logger.info('Using local file storage in directory: uploads/');
}

class StorageService {
  static instance = null;

  constructor() {
    if (USE_GCS && !bucket) {
      throw new Error('Google Cloud Storage bucket is not initialized');
    }

    // Initialize bucket for GCS or use local storage
    if (USE_GCS) {
      this.bucket = bucket;
      this.bucketName = process.env.GCS_BUCKET_NAME || 'user-profile-pictures-sushflix';
    } else {
      // Use the configured upload directory or default to 'public/uploads'
      this.uploadDir = path.resolve(process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads'));
      // Ensure uploads directory exists
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
        logger.info(`Created upload directory: ${this.uploadDir}`);
      }
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new StorageService();
    }
    return this.instance;
  }

  async uploadFile(username, file) {
    let fileName = null;
    let fileUrl = null;

    try {
      if (!file || !file.originalname || !file.mimetype || !file.size || !file.buffer) {
        logger.error('Invalid file object received', {
          username,
          fileProperties: Object.keys(file || {})
        });
        return { success: false, error: 'Invalid file object received' };
      }

      logger.info('Starting upload validation', {
        username,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // Generate a unique filename
      fileName = `${username}-${uuidv4()}${path.extname(file.originalname)}`;

      if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        logger.error('Invalid file type', { 
          username, 
          fileName, 
          mimetype: file.mimetype 
        });
        return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' };
      }

      if (file.size > MAX_FILE_SIZE) {
        logger.error('File size exceeds limit', { 
          username, 
          fileName, 
          size: file.size,
          maxSize: MAX_FILE_SIZE 
        });
        return { success: false, error: 'File size exceeds the 2MB limit.' };
      }

      if (USE_GCS) {
        // Upload to Google Cloud Storage
        logger.info('Starting file upload to GCS', { username, fileName });

        const blob = this.bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              originalName: file.originalname,
              uploadedBy: username,
              uploadedAt: new Date().toISOString()
            }
          },
          resumable: false
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', (error) => {
            logger.error('Stream error during file upload', { 
              error, 
              fileName, 
              username,
              stack: error.stack 
            });
            reject(new Error('Failed to upload file to storage'));
          });

          blobStream.on('finish', async () => {
            try {
              // Make the file public
              await blob.makePublic();
              logger.info('File upload completed successfully', { 
                username, 
                fileName,
                size: file.size
              });
              resolve();
            } catch (error) {
              logger.error('Failed to make file public', {
                error: error.message,
                stack: error.stack,
                username,
                fileName
              });
              reject(error);
            }
          });

          blobStream.end(file.buffer);
        });

        // Get public URL for the uploaded file
        fileUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      } else {
        // Local file storage
        const filePath = path.join(this.uploadDir, fileName);
        
        // Save file to local storage
        await fs.promises.writeFile(filePath, file.buffer);
        fileUrl = `/uploads/${fileName}`;
        
        logger.info('File saved to local storage', {
          username,
          fileName,
          filePath,
          size: file.size
        });
      }

      logger.info('File upload completed', { 
        username, 
        fileName,
        fileUrl,
        storageType: USE_GCS ? 'GCS' : 'local'
      });

      return { 
        success: true, 
        fileName,
        fileUrl,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };

    } catch (error) {
      logger.error('Upload failed', {
        error: error.message,
        stack: error.stack,
        username,
        originalName: file?.originalname || 'unknown',
        fileName
      });

      // Clean up any partial uploads if possible
      if (fileName) {
        try {
          if (USE_GCS) {
            await this.bucket.file(fileName).delete();
            logger.info('Partial file cleaned up from GCS', { fileName });
          } else {
            const filePath = path.join(this.uploadDir, fileName);
            if (fs.existsSync(filePath)) {
              await fs.promises.unlink(filePath);
              logger.info('Partial file cleaned up from local storage', { fileName });
            }
          }
        } catch (cleanupError) {
          logger.error('Failed to clean up partial file', {
            error: cleanupError.message,
            username,
            fileName
          });
        }
      }

      const errorType = error.name || 'UnknownError';
      const errorMessage = {
        StorageError: 'Failed to store file in storage',
        ValidationError: 'Invalid file data',
        PermissionError: 'Insufficient permissions',
        NetworkError: 'Network error while uploading',
        TimeoutError: 'Upload operation timed out',
        UnknownError: 'Failed to upload file'
      }[errorType] || 'Failed to upload file';

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async deleteFile(filename) {
    try {
      if (!filename) {
        logger.error('No filename provided for deletion');
        return { success: false, error: 'Invalid filename provided' };
      }

      if (USE_GCS) {
        await this.bucket.file(filename).delete();
        logger.info('File deleted successfully from GCS', { filename });
      } else {
        const filePath = path.join(this.uploadDir, filename);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          logger.info('File deleted successfully from local storage', { filename });
        } else {
          logger.warn('File not found for deletion', { filename });
          return { success: false, error: 'File not found' };
        }
      }

      return { success: true, message: 'File deleted successfully' };

    } catch (error) {
      const storageType = USE_GCS ? 'GCS' : 'local storage';
      logger.error(`Failed to delete file from ${storageType}`, {
        error: error.message,
        stack: error.stack,
        filename
      });

      return {
        success: false,
        error: error.message || `Failed to delete file from ${storageType}`
      };
    }
  }
}

// Singleton instance
const storageService = StorageService.getInstance();

module.exports = {
  uploadFile: storageService.uploadFile.bind(storageService),
  deleteFile: storageService.deleteFile.bind(storageService)
};
