import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the authenticated user is the owner of the resource
 */
export const isOwner = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const requestedUsername = req.params.username;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (user.username !== requestedUsername) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource',
    });
  }

  next();
};
