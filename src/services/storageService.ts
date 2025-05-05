import { Storage } from '@google-cloud/storage';
import { logger } from '../utils/logger';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE_PATH
});

const BUCKET_NAME = 'user-profile-pictures-sushflix';
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    logger.info('Storage service initialized');
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private getBucket() {
    return storage.bucket(BUCKET_NAME);
  }

  public async uploadFile(username: string, file: File): Promise<UploadResponse> {
    try {
      // Validate file
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'File size exceeds maximum limit of 2MB'
        };
      }

      // Create unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${username}-${timestamp}.${extension}`;

      // Upload to GCS
      const fileBuffer = await file.arrayBuffer();
      const blob = this.getBucket().file(filename);

      await blob.save(Buffer.from(fileBuffer), {
        metadata: {
          contentType: file.type,
          metadata: {
            firebaseStorageDownloadTokens: Date.now().toString(),
            originalFilename: file.name,
            uploadedBy: username
          }
        }
      });

      // Make file publicly accessible
      await blob.makePublic();

      // Generate public URL
      const url = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;

      logger.info(`Successfully uploaded file: ${filename}`, {
        size: file.size,
        type: file.type,
        url
      });

      return {
        success: true,
        url
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('File upload failed', { error });
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  public async deleteFile(filename: string): Promise<boolean> {
    try {
      const blob = this.getBucket().file(filename);
      await blob.delete();
      logger.info(`Successfully deleted file: ${filename}`);
      return true;
    } catch (error: unknown) {
      logger.error('File deletion failed', { error });
      return false;
    }
  }

  public async getFileUrl(filename: string): Promise<string | null> {
    try {
      const blob = this.getBucket().file(filename);
      const [url] = await blob.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });
      return url;
    } catch (error: unknown) {
      logger.error('Failed to get file URL', { error });
      return null;
    }
  }
}
