import { Router, Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import IFeaturedProfile from '../featuredProfileService';
import featuredProfileService from '../featuredProfileService';

const router = Router();

// Types
interface IErrorResponse {
  message: string;
  error?: unknown;
}

interface IFeaturedProfileRequest extends Request {
  body: {
    userId?: string | Types.ObjectId;
    displayOrder?: number;
    isActive?: boolean;
  };
  params: {
    userId?: string;
  };
}

// Error handler middleware
const errorHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('Route handler error:', error);
      const statusCode = (error as any).statusCode || 500;
      const message = (error as any).message || 'Internal server error';
      res.status(statusCode).json({ message });
    }
  };

// Get featured profiles
router.get('/', errorHandler(async (req: Request, res: Response) => {
  try {
    const featuredProfiles = await featuredProfileService.getFeaturedProfiles();
    res.json({ 
      success: true,
      data: { 
        profiles: featuredProfiles 
      } 
    });
  } catch (error) {
    console.error('Error in GET /featured:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching featured profiles',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}));

// Add a featured profile
router.post('/', errorHandler(async (req: IFeaturedProfileRequest, res: Response) => {
  try {
    const { userId, displayOrder } = req.body;
    
    if (!userId || typeof displayOrder !== 'number') {
      return res.status(400).json({ 
        message: 'Missing required fields: userId and displayOrder are required' 
      });
    }

    const featuredProfile = await featuredProfileService.addFeaturedProfile(userId, displayOrder);
    res.status(201).json(featuredProfile);
  } catch (error) {
    console.error('Error in POST /featured-profiles:', error);
    res.status(500).json({ 
      message: 'Error adding featured profile',
      error: error
    });
  }
}));

// Update featured profile display order
router.put('/:userId/order', errorHandler(async (req: IFeaturedProfileRequest, res: Response) => {
  try {
    const { displayOrder } = req.body;
    const { userId } = req.params;

    if (typeof displayOrder !== 'number') {
      return res.status(400).json({ message: 'displayOrder must be a number' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId parameter is required' });
    }

    const featuredProfile = await featuredProfileService.updateFeaturedProfile(userId, displayOrder);
    
    if (!featuredProfile) {
      return res.status(404).json({ message: 'Featured profile not found' });
    }

    res.json(featuredProfile);
  } catch (error) {
    console.error('Error in PUT /featured-profiles/:userId/order:', error);
    res.status(500).json({ 
      message: 'Error updating featured profile',
      error: error
    });
  }
}));

// Update featured profile status (active/inactive)
router.put('/:userId/status', errorHandler(async (req: IFeaturedProfileRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const { userId } = req.params;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId parameter is required' });
    }

    const featuredProfile = await featuredProfileService.updateFeaturedProfileStatus(userId, isActive);
    
    if (!featuredProfile) {
      return res.status(404).json({ message: 'Featured profile not found' });
    }

    res.json(featuredProfile);
  } catch (error) {
    console.error('Error in PUT /featured-profiles/:userId/status:', error);
    res.status(500).json({ 
      message: 'Error updating featured profile status',
      error: error
    });
  }
}));

export default router;
