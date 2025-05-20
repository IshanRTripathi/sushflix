import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as profileService from '../featuredProfileService';

// Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Profile {
  _id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  // Add other profile properties as needed
}

const router = require('express').Router();

/**
 * @route   GET /api/profiles/featured
 * @desc    Get featured profiles
 * @access  Public
 */
router.get('/featured', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const featuredProfiles: Profile[] = await profileService.getFeaturedProfiles();
    
    const response: ApiResponse<{ profiles: Profile[] }> = {
      success: true,
      data: { profiles: featuredProfiles }
    };
    
    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch featured profiles',
      message: errorMessage
    };
    
    res.status(500).json(errorResponse);
  }
}));

export default router;
