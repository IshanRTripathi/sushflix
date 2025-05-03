import express, { Request, Response, RequestHandler } from 'express';
import { userProfileService } from '../services/userProfileService';
import { logger } from '../utils/logger';
import multer, { Multer } from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload: Multer = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
});

interface UsernameParams {
  username: string;
}

interface UserIdParams {
  userId: string;
}

// GET /api/profiles/:username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const profile = await userProfileService.getProfileByUsername(username as string);
    
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching profile:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profiles/:username
router.put('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const updates = req.body;
    
    // Get the profile to verify it exists and get the userId
    const profile = await userProfileService.getProfileByUsername(username as string);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    const success = await userProfileService.updateProfile(profile.userId, updates);
    if (!success) {
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }
    
    // Get the updated profile
    const updatedProfile = await userProfileService.getProfileByUsername(username as string);
    res.json(updatedProfile);
  } catch (error) {
    logger.error('Error updating profile:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profiles/:username/picture
router.post('/:username/picture', upload.single('picture'), async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    // Get the profile to verify it exists and get the userId
    const profile = await userProfileService.getProfileByUsername(username as string);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    const newPicturePath = await userProfileService.updateProfilePicture(
      profile.userId,
      file.buffer,
      file.originalname
    );
    
    if (!newPicturePath) {
      res.status(500).json({ error: 'Failed to update profile picture' });
      return;
    }
    
    res.json({ profilePicture: newPicturePath });
  } catch (error) {
    logger.error('Error updating profile picture:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// GET /api/featured-profiles
router.get('/featured/list', async (req: Request, res: Response) => {
  try {
    const featuredProfiles = await userProfileService.getFeaturedProfiles();
    res.json(featuredProfiles);
  } catch (error) {
    logger.error('Error fetching featured profiles:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to fetch featured profiles' });
  }
});

// GET /api/featured-profiles/:userId
router.get('/featured/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await userProfileService.getProfile(userId as string);
    
    if (!profile) {
      res.status(404).json({ error: 'Featured profile not found' });
      return;
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching featured profile:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to fetch featured profile' });
  }
});

export default router; 