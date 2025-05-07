const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
require('dotenv').config();

// Initialize storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE_PATH
});

// Get bucket
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Configuration constants
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

class StorageService {
  static instance = null;

  constructor() {
    logger.info('Storage service initialized');
    this.bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
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
        return {
          success: false,
          error: 'Invalid file object received'
        };
      }

      logger.info('Starting GCS upload', {
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
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        logger.error('File too large', {
          username,
          size: file.size,
          maxSize: MAX_FILE_SIZE,
          fileName
        });
        return {
          success: false,
          error: 'File size too large. Maximum allowed size is 2MB.'
        };
      }

      logger.info('File upload validations done', { fileName });

      const fileStream = this.bucket.file(fileName).createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            username,
            originalName: file.originalname
          }
        }
      });

      logger.info('Created write stream, starting file upload', { fileName });

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
            logger.info('File upload completed successfully', {
              username,
              fileName
            });
            resolve();
          })
          .end(file.buffer);
      });

      // Create public URL using bucket name
      const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
      logger.info('File upload completed successfully', {
        username,
        fileName,
        publicUrl
      });
      logger.info('Upload completed successfully', {
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
      logger.error('Error in GCS upload', {
        error: error.message,
        stack: error.stack,
        username,
        originalName: file.originalname,
        type: error.name || 'UnknownError'
      });

      if (fileName) {
        try {
          await this.bucket.file(fileName).delete();
          logger.info('Cleanup successful', { username, fileName });
        } catch (cleanupError) {
          logger.error('Error during cleanup', {
            error: cleanupError.message,
            username,
            fileName
          });
        }
      }

      const errorType = error.name || 'UnknownError';
      const errorMessage = {
        'StorageError': 'Failed to store file in cloud storage',
        'ValidationError': 'Invalid file data',
        'PermissionError': 'Insufficient permissions to upload file',
        'NetworkError': 'Network error while uploading',
        'TimeoutError': 'Upload operation timed out',
        'UnknownError': 'Failed to upload file'
      }[errorType] || 'Failed to upload file';

      logger.error('Final error response', {
        username,
        errorType,
        errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async deleteFile(filename) {
    try {
      const file = this.bucket.file(filename);
      await file.delete();
      logger.info('File deleted successfully', { filename });
      return true;
    } catch (error) {
      logger.error('Error deleting file from GCS', {
        error: error.message,
        stack: error.stack,
        filename
      });
      return false;
    }
  }
}

const storageService = StorageService.getInstance();
module.exports = {
  uploadFile: async function(username, file) {
    let fileName = null;
    try {
      if (!file || !file.originalname || !file.mimetype || !file.size || !file.buffer) {
        logger.error('Invalid file object received', {
          username,
          fileProperties: Object.keys(file || {})
        });
        return {
          success: false,
          error: 'Invalid file object received'
        };
      }

      logger.info('Starting GCS upload', {
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
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        logger.error('File too large', {
          username,
          size: file.size,
          maxSize: MAX_FILE_SIZE,
          fileName
        });
        return {
          success: false,
          error: 'File size too large. Maximum allowed size is 2MB.'
        };
      }

      logger.info('File upload validations done', { fileName });

      const fileStream = bucket.file(fileName).createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            username,
            originalName: file.originalname
          }
        }
      });

      logger.info('Created write stream, starting file upload', { fileName });

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
            logger.info('File upload completed successfully', {
              username,
              fileName
            });
            resolve();
          })
          .end(file.buffer);
      });

      // Create public URL using bucket name
      const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
      logger.info('File upload completed successfully', {
        username,
        fileName,
        publicUrl
      });
      logger.info('Upload completed successfully', {
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
      logger.error('Error in GCS upload', {
        error: error.message,
        stack: error.stack,
        username,
        originalName: file.originalname,
        type: error.name || 'UnknownError'
      });

      if (fileName) {
        try {
          await bucket.file(fileName).delete();
          logger.info('Cleanup successful', { username, fileName });
        } catch (cleanupError) {
          logger.error('Error during cleanup', {
            error: cleanupError.message,
            username,
            fileName
          });
        }
      }

      const errorType = error.name || 'UnknownError';
      const errorMessage = {
        'StorageError': 'Failed to store file in cloud storage',
        'ValidationError': 'Invalid file data',
        'PermissionError': 'Insufficient permissions to upload file',
        'NetworkError': 'Network error while uploading',
        'TimeoutError': 'Upload operation timed out',
        'UnknownError': 'Failed to upload file'
      }[errorType] || 'Failed to upload file';

      logger.error('Final error response', {
        username,
        errorType,
        errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  deleteFile: async function(filename) {
    try {
      if (!filename) {
        logger.error('Invalid filename provided', {
          filename
        });
        return {
          success: false,
          error: 'Invalid filename provided'
        };
      }

      const file = bucket.file(filename);
      await file.delete();
      logger.info('File deleted successfully', { filename });
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting file from GCS', {
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
};