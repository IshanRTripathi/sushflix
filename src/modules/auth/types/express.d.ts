import { User } from '../../../modules/shared/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
