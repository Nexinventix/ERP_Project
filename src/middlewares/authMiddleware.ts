import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Users, {User} from '../models/users';
import {
    SECRET_KEY
 } from '@config'

interface AuthenticatedRequest extends Request {
    user: User;
  }

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, SECRET_KEY!) as { id: string };
    const user = await Users.findOne({ _id: decoded.id });

    if (!user) {
      throw new Error('User not found');
    }

    // Set the user on the request object
    req.user = user;
    next();
  } catch (error) {
    // res.status(401).json({ message: error.message });
    if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
  }
};