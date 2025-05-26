import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import User, { IUser, IUserModel, UserRole } from '../../../profile/service/models/User';
import { logger } from '../../../shared/utils/logger'

// Type-safe environment variable access
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Environment variables with type safety
const JWT_SECRET = getEnvVar('JWT_SECRET');
const NODE_ENV = process.env['NODE_ENV'] || 'development';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '1d';

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

// JWT payload type with type guard
interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
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

// Helper function to handle async route handlers
const asyncHandler = <P, ResBody, ReqBody, ReqQuery>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<void>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => 
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Validation middleware
const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    } catch (error) {
      next(error);
    }
  };
};

// Generate JWT token with proper typing
const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  };

  // Convert expiresIn to seconds if it's a string with time unit
  const expiresIn = JWT_EXPIRES_IN.endsWith('d') 
    ? parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60 // Convert days to seconds
    : JWT_EXPIRES_IN.endsWith('h')
    ? parseInt(JWT_EXPIRES_IN) * 60 * 60 // Convert hours to seconds
    : parseInt(JWT_EXPIRES_IN); // Assume seconds if no unit

  const options: SignOptions = {
    expiresIn: expiresIn // Now it's a number which is compatible with SignOptions
  };

  return jwt.sign(payload, JWT_SECRET, options);
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

// Add this interface for the signup response
interface SignupResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isCreator: boolean;
  };
}

router.post(
  '/signup',
  validateRequest(signupValidation),
  asyncHandler<{}, SignupResponse, SignupRequestBody, any>(async (req, res) => {
    logger.info('Executing route: POST /api/signup');
    logger.info(`Received registration request body: ${JSON.stringify(req.body)}`);

    const { username, email, password, isCreator = false } = req.body;

    try {
      // Check if user already exists
      const existingUser = await (User as IUserModel).findOne({ 
        $or: [
          { email: { $regex: new RegExp(`^${email}$`, 'i') } }, 
          { username: { $regex: new RegExp(`^${username}$`, 'i') } }
        ] 
      });
      
      if (existingUser) {
        res.status(400).json({
          errors: [{ msg: 'User already exists with this email or username' }]
        });
        return;
      }

      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email,
        password: hashedPassword,
        isCreator,
        role: isCreator ? 'creator' : 'user',
        emailVerified: false,
        profilePicture: ''
      });

      await user.save();
      // Generate tokens
       const token = generateToken(user);
       const refreshToken = jwt.sign(
         { userId: user._id },
         JWT_SECRET,
         { expiresIn: '7d' }
       );
 
       // Update user with refresh token
       user.refreshToken = refreshToken;

      res.status(201).json({
        success: true,
        token,
        refreshToken, // Make sure to generate this if not already
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isCreator: user.role === 'creator' || user.role === 'admin'
        }
      });
  
    } catch (error) {
      logger.error('Error during user registration:', { error });
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

// Response types for auth routes
interface SuccessResponse<T> {
  success: true;
  token: string;
  refreshToken: string;
  user: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ msg: string }>;
}

interface LoginUserData {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isCreator: boolean;
}

type LoginResponse = (SuccessResponse<LoginUserData> & LoginUserData) | ErrorResponse;

// Login route handler with proper typing
router.post<{}, LoginResponse, LoginRequestBody>(
  '/login',
  validateRequest(loginValidation),
  asyncHandler<{}, LoginResponse, LoginRequestBody, any>(async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    
    // Find user by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${usernameOrEmail}$`, 'i') } },
        { username: { $regex: new RegExp(`^${usernameOrEmail}$`, 'i') } }
      ]
    }).select('+password');
    
    logger.debug('User lookup result', { 
      userFound: !!user,
      userId: user?._id,
      username: user?.username 
    });

    if (!user) {
      const errorMessage = 'User not found with provided credentials';
      logger.warn('Login failed: User not found', { usernameOrEmail });
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: [{ msg: 'Invalid email/username or password' }]
      });
      return;
    }

    // Type-safe password check
    if (!user.password) {
      const errorMessage = 'User password not found in database';
      logger.error(errorMessage, { userId: user._id });
      throw new Error(errorMessage);
    }
    
    logger.debug('Comparing provided password with stored hash');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      logger.warn('Login failed: Invalid password', { 
        userId: user._id,
        username: user.username 
      });
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: [{ msg: 'Invalid email/username or password' }]
      });
      return;
    }

    // Generate tokens
    logger.debug('Generating access token');
    const token = generateToken(user);
    logger.debug('Generating refresh token');
    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Update user with refresh token
    logger.debug('Updating user with refresh token');
    user.refreshToken = refreshToken;
    try {
      await user.save();
      logger.debug('User document updated with refresh token');
    } catch (error) {
      logger.error('Failed to save refresh token to user document', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user._id
      });
      throw new Error('Failed to complete login process');
    }

    // Create user data object
    const userData = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      isCreator: user.role === 'creator' || user.role === 'admin'
    };

    // Create a clean user response object with only the fields we want to expose
    const { password: _, refreshToken: __, ...safeUserData } = userData as any;
    const userResponse = {
      id: safeUserData.id || safeUserData._id?.toString(),
      username: safeUserData.username,
      email: safeUserData.email,
      role: safeUserData.role,
      isCreator: safeUserData.isCreator || safeUserData.role === 'creator' || safeUserData.role === 'admin',
      // Explicitly include any other safe fields needed by the frontend
      ...(safeUserData.avatar && { avatar: safeUserData.avatar }),
      ...(safeUserData.createdAt && { createdAt: safeUserData.createdAt }),
      ...(safeUserData.updatedAt && { updatedAt: safeUserData.updatedAt })
    };

    // Create response object with proper typing
    const response: SuccessResponse<LoginUserData> = {
      success: true,
      token,
      refreshToken,
      user: userResponse
    };

    // Log the login response without sensitive data
    logger.info('Login successful', { 
      userId: userData.id,
      username: userData.username,
      role: userData.role,
      hasToken: !!token,
      hasRefreshToken: !!refreshToken
    });
    
    res.status(200).json(response);
  })
);

export default router;
