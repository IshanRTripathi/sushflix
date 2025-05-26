import { Storage, Bucket, File } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../shared/utils/logger';

interface FileObject {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  [key: string]: any;
}

interface UploadResult {
  success: boolean;
  fileName?: string;
  fileUrl?: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
  error?: string;
  message?: string;
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const USE_GCS = 'true';

let storage: Storage | null = null;
let bucket: Bucket | null = null;

if (USE_GCS) {
  try {
    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE_PATH
    });
    const bucketName = process.env.GCS_BUCKET_NAME || 'user-profile-pictures-sushflix';
    bucket = storage.bucket(bucketName);
    logger.info('Google Cloud Storage initialized with bucket:', { bucket: bucketName });
  } catch (error) {
    logger.error('Failed to initialize Google Cloud Storage:', { error });
    throw new Error('Failed to initialize Google Cloud Storage');
  }
} else {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  logger.info('Using local file storage in directory: uploads/');
}

class StorageService {
  private static instance: StorageService | null = null;
  private bucket: Bucket | null = null;
  private bucketName: string = '';
  private uploadDir: string = '';

  private constructor() {
    if (!bucket) {
      throw new Error('Google Cloud Storage bucket is not initialized');
    }
    this.bucket = bucket;
    this.bucketName = process.env.GCS_BUCKET_NAME || 'user-profile-pictures-sushflix';
  }

  public static getInstance(): StorageService {
    if (!this.instance) {
      this.instance = new StorageService();
    }
    return this.instance;
  }

  public async uploadFile(username: string, file: FileObject): Promise<UploadResult> {
    let fileName = '';
    let fileUrl: string | null = null;

    try {
      if (!file || !file.originalname || !file.mimetype || !file.size || !file.buffer) {
        logger.error('Invalid file object received', {
          username,
          fileProperties: file ? Object.keys(file) : []
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
          fileName, 
          mimetype: file.mimetype 
        });
        return { 
          success: false, 
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        logger.error('File size exceeds limit', { 
          username, 
          fileName, 
          size: file.size,
          maxSize: MAX_FILE_SIZE 
        });
        return { 
          success: false, 
          error: 'File size exceeds the 2MB limit.' 
        };
      }

      if (USE_GCS && this.bucket) {
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

        await new Promise<void>((resolve, reject) => {
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
              await blob.makePublic();
              logger.info('File upload completed successfully', { 
                username, 
                fileName,
                size: file.size
              });
              resolve();
            } catch (error) {
              logger.error('Failed to make file public', {
                error: error instanceof Error ? error.message : 'Unknown error',
                username,
                fileName
              });
              reject(error);
            }
          });

          blobStream.end(file.buffer);
        });

        fileUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      } else {
        const filePath = path.join(this.uploadDir, fileName);
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
        fileUrl: fileUrl || '',
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Upload failed', {
        error: errorMessage,
        username,
        originalName: file?.originalname || 'unknown',
        fileName
      });

      if (fileName) {
        try {
          if (USE_GCS && this.bucket) {
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
            error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error',
            username,
            fileName
          });
        }
      }

      const errorType = error instanceof Error ? error.name : 'UnknownError';
      const errorMessageMap: Record<string, string> = {
        StorageError: 'Failed to store file in storage',
        ValidationError: 'Invalid file data',
        PermissionError: 'Insufficient permissions',
        NetworkError: 'Network error while uploading',
        TimeoutError: 'Upload operation timed out',
        UnknownError: 'Failed to upload file'
      };

      return {
        success: false,
        error: errorMessageMap[errorType] || 'Failed to upload file'
      };
    }
  }

  public async deleteFile(filename: string): Promise<UploadResult> {
    try {
      if (!filename) {
        logger.error('No filename provided for deletion');
        return { success: false, error: 'Invalid filename provided' };
      }

      if (USE_GCS && this.bucket) {
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
        error: error instanceof Error ? error.message : 'Unknown error',
        filename
      });

      return {
        success: false,
        error: `Failed to delete file from ${storageType}`
      };
    }
  }
}

// Singleton instance
const storageService = StorageService.getInstance();

export const uploadFile = storageService.uploadFile.bind(storageService);
export const deleteFile = storageService.deleteFile.bind(storageService);
export default StorageService;
