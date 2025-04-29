import { Request, Response, NextFunction } from 'express';
import { IUser } from '../../models/user';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
export type AuthenticatedRequestHandler = (req: Request & { user: IUser }, res: Response, next: NextFunction) => Promise<void> | void;
