import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Types
interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  isCreator: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  save(): Promise<User>;
}

// Mock User model - replace with actual model import
const User = {
  findOne: async (query: any): Promise<User | null> => {
    // Implementation should come from your actual User model
    return null;
  },
  findById: async (id: string): Promise<User | null> => {
    // Implementation should come from your actual User model
    return null;
  },
  create: async (userData: Partial<User>): Promise<User> => {
    // Implementation should come from your actual User model
    return userData as User;
  }
};

// Logger
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || ''),
  debug: (message: string, meta?: any) => console.debug(`[DEBUG] ${message}`, meta || '')
};

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router = express.Router();

// Request body types
interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
  isCreator?: boolean;
}

interface LoginRequestBody {
  usernameOrEmail: string;
  password: string;
}

// JWT payload type
interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  isCreator: boolean;
  iat?: number;
  exp?: number;
}

// Helper function to handle async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Validation middleware
const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    next();
  };
};

// POST /signup
const signupValidation: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one capital letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
];

router.post(
  '/signup',
  validateRequest(signupValidation),
  asyncHandler(async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    logger.info('Executing route: POST /api/signup');
    logger.info(`Received registration request body: ${JSON.stringify(req.body)}`);

    const { username, email, password, isCreator = false } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        res.status(400).json({
          errors: [{ msg: 'User already exists with this email or username' }]
        });
        return;
      }

      
      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        isCreator
      });

      // Create JWT
      const payload: JwtPayload = {
        userId: user._id,
        email: user.email,
        username: user.username,
        isCreator: user.isCreator
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isCreator: user.isCreator
        }
      });
    } catch (error) {
      logger.error('Error during user registration:', error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  })
);

// POST /login
const loginValidation: ValidationChain[] = [
  body('usernameOrEmail')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post(
  '/login',
  validateRequest(loginValidation),
  asyncHandler(async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    logger.info('Executing route: POST /api/login');
    
    const { usernameOrEmail, password } = req.body;

    try {
      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: usernameOrEmail },
          { username: usernameOrEmail }
        ]
      });

      if (!user) {
        res.status(401).json({
          errors: [{ msg: 'Invalid credentials' }]
        });
        return;
      }


      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          errors: [{ msg: 'Invalid credentials' }]
        });
        return;
      }

      // Create JWT
      const payload: JwtPayload = {
        userId: user._id,
        email: user.email,
        username: user.username,
        isCreator: user.isCreator
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
      });

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isCreator: user.isCreator
        }
      });
    } catch (error) {
      logger.error('Error during login:', error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  })
);

export default router;
