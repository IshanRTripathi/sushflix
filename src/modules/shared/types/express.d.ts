import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export interface IUserRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}
