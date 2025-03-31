import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Users, { User, Module } from '../models/users';
import { sendEmail } from '@utils/emailService'; // Placeholder for email function
import {
    SECRET_KEY
 } from '@config'

interface AuthenticatedRequest extends Request {
  user: User;
}

class UserController {
    // Super Admin Signup
  async signupSuperAdmin(req: Request, res: Response) {
    try {
      const { firstName, lastName, phoneNumber, email, password } = req.body;

      // Check if a super admin already exists
      const existingSuperAdmin = await Users.findOne({ isSuperAdmin: true });
      if (existingSuperAdmin) {
        return res.status(400).json({ message: 'Super admin already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the super admin
    //   const superAdmin = new Users({
    //     firstName,
    //     lastName,
    //     phoneNumber,
    //     email,
    //     password: hashedPassword,
    //     department: 'ADMIN', // Assign a default department
    //     modules: [], // Super admins have access to all modules
    //     isSuperAdmin: true
    //   });

    const superAdmin = new Users({
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        modules: Object.values(Module), // Super admins get all modules
        isSuperAdmin: true
      });
      

      await superAdmin.save();

      // Generate JWT Token
      const token = jwt.sign({ id: superAdmin._id, isSuperAdmin: true }, SECRET_KEY!, {
        expiresIn: '7d'
      });

      res.status(201).json({ message: 'Super Admin Created Successfully', token, user: superAdmin });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
          } else {
            res.status(400).json({ message: 'An unknown error occurred' });
          }
    }
  }
  // Create a new user (only superadmin can do this)
  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const requestingUser = req.user as User;
      if (!requestingUser.isSuperAdmin) {
        return res.status(403).json({ message: 'Only super admins can create users' });
      }

      const { firstName, lastName, phoneNumber, email, department, modules, isSuperAdmin } = req.body;

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const user = new Users({
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        department,
        modules: modules || [department], // Default modules to department
        isSuperAdmin: isSuperAdmin || false,
      });

      await user.save();

      // Send email notification
      await sendEmail(email, 'Your Account Has Been Created', 
        `Hello ${firstName}, your account has been created. Your temporary password is: ${tempPassword}. Please log in and update your password.`);

      res.status(201).json({ message: 'User created successfully, an email has been sent.' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  // Create a Super Admin (only existing superadmins can do this)
  async createSuperAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const requestingUser = req.user as User;
      if (!requestingUser.isSuperAdmin) {
        return res.status(403).json({ message: 'Only super admins can create other super admins' });
      }

      const { firstName, lastName, phoneNumber, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const superAdmin = new Users({
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        isSuperAdmin: true,
        modules: Object.values(Module), // Super admins get all modules
      });

      await superAdmin.save();
      res.status(201).json({ message: 'Super Admin created successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  // User Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email }).select('+password'); // Include password in query

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, isSuperAdmin: user.isSuperAdmin }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
      });

      res.json({ message: 'Login successful', token });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  // Update user password
  async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user as User;

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  // Get all users (only superadmins can do this)
  async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const requestingUser = req.user as User;
      if (!requestingUser.isSuperAdmin) {
        return res.status(403).json({ message: 'Only super admins can view all users' });
      }

      const users = await Users.find().select('-password -__v');
      res.json(users);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }
}

export default new UserController();
