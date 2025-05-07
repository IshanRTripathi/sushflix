const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
require('dotenv').config();

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Initialize storage client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE_PATH
});

class StorageService {
  static instance = null;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME;
    this.bucket = storage.bucket(this.bucketName);
    logger.info('StorageService initialized with bucket:', { bucket: this.bucketName });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new StorageService();
    }
    return this.instance;
  }

  async uploadFile(username, file) {
    let fileName = null;

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

      fileName = `${username}-${uuidv4()}${path.extname(file.originalname)}`;

      if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        logger.error('Invalid file type', {
          username,
          mimetype: file.mimetype,
          allowedTypes: ALLOWED_FILE_TYPES,
          fileName
        });
        return { success: false, error: 'Only JPEG, PNG, and WebP images are allowed.' };
      }

      if (file.size > MAX_FILE_SIZE) {
        logger.error('File size too large', {
          username,
          size: file.size,
          maxSize: MAX_FILE_SIZE,
          fileName
        });
        return { success: false, error: 'Maximum allowed file size is 2MB.' };
      }

      logger.info('File passed validation, starting upload', { fileName });

      const fileRef = this.bucket.file(fileName);
      const fileStream = fileRef.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            username,
            originalName: file.originalname
          }
        }
      });

      await new Promise((resolve, reject) => {
        fileStream
          .on('error', (err) => {
            logger.error('Stream error during file upload', {
              error: err.message,
              stack: err.stack,
              username,
              fileName
            });
            reject(err);
          })
          .on('finish', () => {
            logger.info('Upload stream finished', {
              username,
              fileName
            });
            resolve();
          })
          .end(file.buffer);
      });

      // Create public URL directly since bucket has uniform access enabled
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      logger.info('File upload complete', {
        username,
        fileName,
        publicUrl
      });

      return {
        success: true,
        url: publicUrl,
        filename: fileName,
        originalName: file.originalname
      };

    } catch (error) {
      logger.error('Upload failed', {
        error: error.message,
        stack: error.stack,
        username,
        originalName: file?.originalname || 'unknown',
        fileName
      });

      if (fileName) {
        try {
          await this.bucket.file(fileName).delete();
          logger.info('Partial file cleaned up from bucket', { fileName });
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
        StorageError: 'Failed to store file in cloud storage',
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

      await this.bucket.file(filename).delete();
      logger.info('File deleted successfully from GCS', { filename });

      return { success: true, message: 'File deleted successfully' };

    } catch (error) {
      logger.error('Failed to delete file from GCS', {
        error: error.message,
        stack: error.stack,
        filename
      });

      return {
        success: false,
        error: error.message || 'Failed to delete file'
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
