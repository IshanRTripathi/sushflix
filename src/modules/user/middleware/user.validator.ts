import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include file property
declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File;
  }
}

// Types for validation
type ValidationError = {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
};

type ApiErrorResponse = {
  success: boolean;
  error: string;
  details?: {
    code: string;
    errors: ValidationError[];
  };
};

// Common validation rules
export const validateUsernameParam: ValidationChain = param('username')
  .trim()
  .notEmpty()
  .withMessage('Username is required')
  .isLength({ min: 3, max: 30 })
  .withMessage('Username must be between 3 and 30 characters')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can only contain letters, numbers, and underscores')
  .escape();

export const updateProfileValidation: ValidationChain[] = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters')
    .escape(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
    .escape(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  
  body('socialLinks.*')
    .optional()
    .isURL()
    .withMessage('Social link must be a valid URL')
];

// File upload validation middleware
export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  // Check if file exists
  if (!req.file) {
    const error: ApiErrorResponse = {
      success: false,
      error: 'No file uploaded',
      details: {
        code: 'VALIDATION_ERROR',
        errors: [{
          field: 'file',
          message: 'A profile picture is required'
        }]
      }
    };
    return res.status(400).json(error);
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    const error: ApiErrorResponse = {
      success: false,
      error: 'Invalid file type',
      details: {
        code: 'VALIDATION_ERROR',
        errors: [{
          field: 'file',
          message: 'Only JPEG, PNG, GIF, and WebP images are allowed',
          value: req.file.mimetype
        }]
      }
    };
    return res.status(400).json(error);
  }

  // Validate file size (5MB max)
  const maxFileSize = 5 * 1024 * 1024;
  if (req.file.size > maxFileSize) {
    const error: ApiErrorResponse = {
      success: false,
      error: 'File too large',
      details: {
        code: 'VALIDATION_ERROR',
        errors: [{
          field: 'file',
          message: 'Profile picture must be less than 5MB',
          value: `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`
        }]
      }
    };
    return res.status(400).json(error);
  }

  next();
};

// Helper function to validate request
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((error): ValidationError => {
      const errorData: ValidationError = {
        field: (error as any).path || (error as any).param || 'unknown',
        message: error.msg,
        code: 'VALIDATION_ERROR'
      };
      
      if ((error as any).value !== undefined) {
        errorData.value = (error as any).value;
      }
      
      return errorData;
    });
    
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Validation failed',
      details: {
        code: 'VALIDATION_ERROR',
        errors: validationErrors
      }
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  
  next();
};

// File upload validation middleware chain
export const validateUploadProfilePicture = [
  validateFileUpload,
  validateRequest
];
