import express, { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Content, { IContent, MediaType } from '../models/Content';

const router = express.Router();

// Type for authenticated requests
type AuthRequest = Request & {
  user: {
    userId: string | Types.ObjectId;
    role?: string;
  };
};

// Type for the request body when creating/updating content
interface ContentRequest {
  title: string;
  description: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  isExclusive?: boolean;
  requiredLevel?: 0 | 1 | 2 | 3;
  creator?: string | Types.ObjectId;
}

// Type for query parameters
interface ContentQueryParams {
  creator?: string;
  isExclusive?: string;
  mediaType?: MediaType;
  page?: string;
  limit?: string;
}

// Type for the request with query params
type ContentListRequest = Request<{}, {}, {}, ContentQueryParams>;

// Type guard to check if request is authenticated
function isAuthRequest(req: Request): req is AuthRequest {
  const authReq = req as AuthRequest;
  return !!(authReq.user && authReq.user.userId);
}


export default router;
