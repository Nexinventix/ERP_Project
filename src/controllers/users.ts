import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Users, { User, Module, Department } from '../models/users';
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

      const token = jwt.sign({ id: user._id, isSuperAdmin: user.isSuperAdmin }, SECRET_KEY!, {
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

  async grantPermission(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ message: 'Only super admins can grant permissions' });
      }

      const { userId } = req.params;
      const { department } = req.body;

      if (!Object.values(Department).includes(department)) {
        return res.status(400).json({ message: 'Invalid department' });
      }

      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!user.modules.includes(department)) {
        user.modules.push(department as Module);
        await user.save();
      }

      res.json({ message: 'Permission granted', user });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Revoke Permission (Remove Department from User's Modules)
  async revokePermission(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ message: 'Only super admins can revoke permissions' });
      }

      const { userId } = req.params;
      const { department } = req.body;

      if (!Object.values(Department).includes(department)) {
        return res.status(400).json({ message: 'Invalid department' });
      }

      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.modules = user.modules.filter(mod => mod !== department);
      await user.save();

      res.json({ message: 'Permission revoked', user });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Update User Info
  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ message: 'Only super admins can update users' });
      }

      const { userId } = req.params;
      const updates = req.body;

      const user = await Users.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json({ message: 'User updated', user });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Delete User
  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ message: 'Only super admins can delete users' });
      }

      const { userId } = req.params;
      const user = await Users.findByIdAndDelete(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }
}

export default new UserController();
