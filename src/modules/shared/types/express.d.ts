import { Request } from 'express';
import { User } from './index';

declare global {
  namespace Express {
    // Re-export the main User interface
    interface User extends User {}

    interface Request {
      user?: User;
    }
  }
}

export interface IUserRequest extends Request {
  user?: User;
}
