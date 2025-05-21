import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the authenticated user is the owner of the resource
 * @param paramName - The name of the URL parameter that contains the identifier to check against
 */
export const isOwner = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const resourceId = req.params[paramName];

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if the user is the owner of the resource
    // This assumes the username is used as the identifier in the URL
    if (user.username !== resourceId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};
