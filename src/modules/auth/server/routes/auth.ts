import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import User, { IUser, IUserModel, UserRole } from '../../../profile/service/models/User';

// Validate JWT_SECRET is set at startup
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

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
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

// JWT payload type
interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
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

// Generate JWT token
const generateToken = (user: IUser): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const expiresIn = process.env['JWT_EXPIRES_IN'] || '1d';
  const options: SignOptions = {
    expiresIn: expiresIn as unknown as number // JWT accepts string or number for expiresIn
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

router.post(
  '/signup',
  validateRequest(signupValidation),
  asyncHandler<{}, any, SignupRequestBody, any>(async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
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

      // Create JWT payload with proper typing
      const payload: JwtPayload = {
        userId: (user as any)._id.toString(),
        email: user.email,
        username: user.username || '',
        role: user.role || 'user'
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d'
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isCreator: user.role === 'creator' || user.role === 'admin'
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

// Login route handler
const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Executing route: POST /api/login');
  
  const { usernameOrEmail, password } = req.body as LoginRequestBody;

  try {
    // Find user by email or username
    const user = await (User as IUserModel).findOne({
      $or: [
        { email: { $regex: new RegExp(`^${usernameOrEmail}$`, 'i') } },
        { username: { $regex: new RegExp(`^${usernameOrEmail}$`, 'i') } }
      ]
    }).select('+password +refreshToken').exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: [{ msg: 'Invalid email/username or password' }]
      });
    }

    // Check password
    if (!user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: [{ msg: 'Invalid email/username or password' }]
      });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    const isProduction = process.env['NODE_ENV'] === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Get public user data and send response
    const responseData = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isCreator: user.role === 'creator' || user.role === 'admin',
          profilePicture: user.profilePicture || '',
          displayName: user.displayName || user.username
        }
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    logger.error('Error during login:', error);
    next(error);
  }
};

// Login route
router.post('/login', validateRequest(loginValidation), (req: Request, res: Response, next: NextFunction) => {
  loginHandler(req, res, next).catch(next);
});

export default router;
