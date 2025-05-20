import { Request, Response, NextFunction } from 'express';
import { Document, Model } from 'mongoose';

// Types
interface ISubscription extends Document {
  subscriber: string;
  creator: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  save(): Promise<ISubscription>;
}

interface IUserRequest extends Request {
  user?: {
    userId: string;
    roles?: string[];
  };
}

// Mock Subscription model - replace with actual model import
declare const Subscription: Model<ISubscription> & {
  find(conditions: any): Promise<ISubscription[]>;
  findOne(conditions: any): Promise<ISubscription | null>;
  findById(id: string): Promise<ISubscription | null>;
  create(data: Partial<ISubscription>): Promise<ISubscription>;
};

// Mock auth middleware - replace with actual auth middleware
const auth = (roles?: string[]) => {
  return (req: IUserRequest, res: Response, next: NextFunction) => {
    // This is a mock implementation - replace with actual auth logic
    next();
  };
};

// Mock logger - replace with actual logger
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
};

const router = require('express').Router();

// Create subscription
router.post('/', auth(), async (req: IUserRequest, res: Response) => {
  logger.info('POST /api/subscriptions route handler executed');
  
  if (!req.user?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const subscription = new Subscription({
      subscriber: req.user.userId,
      ...req.body,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    await subscription.save();
    logger.info(`Subscription created: ${subscription._id}`);
    
    // Remove sensitive data before sending response
    const subscriptionObj = subscription.toObject();
    delete subscriptionObj.__v;
    
    res.status(201).json(subscriptionObj);
  } catch (err: any) {
    logger.error(`Subscription creation error: ${err.message}`);
    
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Subscription already exists' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user's subscriptions
router.get('/my', auth(), async (req: IUserRequest, res: Response) => {
  logger.info('GET /api/subscriptions/my route handler executed');
  
  if (!req.user?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const subscriptions = await Subscription.find({ 
      subscriber: req.user.userId,
      status: 'active'
    }).populate('creator', 'username name');
    
    res.json(subscriptions);
  } catch (err: any) {
    logger.error(`Subscription fetch error: ${err.message}`);
    
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: 'Validation error' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get creator's subscribers
router.get('/subscribers', auth(['creator']), async (req: IUserRequest, res: Response) => {
  logger.info('GET /api/subscriptions/subscribers route handler executed');
  
  if (!req.user?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const subscriptions = await Subscription.find({ 
      creator: req.user.userId,
      status: 'active'
    }).populate('subscriber', 'username name');
    
    res.json(subscriptions);
  } catch (err: any) {
    logger.error(`Subscribers fetch error: ${err.message}`);
    
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: 'Validation error' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// Cancel subscription
router.patch('/:id/cancel', auth(), async (req: IUserRequest, res: Response) => {
  logger.info('PATCH /api/subscriptions/:id/cancel route handler executed');
  
  if (!req.user?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      subscriber: req.user.userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();
    
    logger.info(`Subscription cancelled: ${subscription._id}`);
    
    // Remove sensitive data before sending response
    const subscriptionObj = subscription.toObject();
    delete subscriptionObj.__v;
    
    res.json(subscriptionObj);
  } catch (err: any) {
    logger.error(`Subscription cancellation error: ${err.message}`);
    
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: 'Validation error' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
