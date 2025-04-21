"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importStar(require("../models/users"));
const emailService_1 = require("@utils/emailService"); // Placeholder for email function
const _config_1 = require("@config");
class UserController {
    // Super Admin Signup
    signupSuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { firstName, lastName, phoneNumber, email, password } = req.body;
                // Check if a super admin already exists
                const existingSuperAdmin = yield users_1.default.findOne({ isSuperAdmin: true });
                if (existingSuperAdmin) {
                    return res.status(400).json({ message: 'Super admin already exists' });
                }
                // Hash password
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                // Create the super admin
                const superAdmin = new users_1.default({
                    firstName,
                    lastName,
                    phoneNumber,
                    email,
                    password: hashedPassword,
                    modules: Object.values(users_1.Module), // Super admins get all modules
                    isSuperAdmin: true
                });
                yield superAdmin.save();
                // Generate JWT Token
                const token = jsonwebtoken_1.default.sign({ id: superAdmin._id, isSuperAdmin: true }, _config_1.SECRET_KEY, {
                    expiresIn: '7d'
                });
                res.status(201).json({ message: 'Super Admin Created Successfully', token, user: superAdmin });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    // Create a new user (only superadmin can do this)
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestingUser = req.user;
                if (!requestingUser.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can create users' });
                }
                const { firstName, lastName, phoneNumber, email, department, modules, isSuperAdmin, isAdministrator } = req.body;
                // Generate a temporary password
                const tempPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = yield bcryptjs_1.default.hash(tempPassword, 10);
                const user = new users_1.default({
                    firstName,
                    lastName,
                    phoneNumber,
                    email,
                    password: hashedPassword,
                    department,
                    modules: modules || [department], // Default modules to department
                    isSuperAdmin: isSuperAdmin || false,
                    isAdministrator: isAdministrator || false,
                });
                yield user.save();
                // Send email notification (HTML and plain text)
                const plainText = `Hello ${firstName},\r\n\r\nWelcome to DreamWorks ERP!\r\n\r\nYour account has been successfully created.\r\n\r\nEmail: ${email}\r\nTemporary Password: ${tempPassword}\r\n\r\nFor your security, please log in as soon as possible and update your password.\r\n\r\nIf you have any questions or need assistance, feel free to reply to this email.\r\n\r\nBest regards,\r\nThe DreamWorks ERP Team`;
                const { generateAccountCreatedEmailHTML } = yield Promise.resolve().then(() => __importStar(require('@utils/emailService')));
                const html = generateAccountCreatedEmailHTML(firstName, email, tempPassword);
                yield (0, emailService_1.sendEmail)(email, 'Your Account Has Been Created', plainText, html);
                res.status(201).json({ message: 'User created successfully, an email has been sent.' });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    // Create a Super Admin (only existing superadmins can do this)
    createSuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestingUser = req.user;
                if (!requestingUser.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can create other super admins' });
                }
                const { firstName, lastName, phoneNumber, email, password } = req.body;
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                const superAdmin = new users_1.default({
                    firstName,
                    lastName,
                    phoneNumber,
                    email,
                    password: hashedPassword,
                    isSuperAdmin: true,
                    modules: Object.values(users_1.Module), // Super admins get all modules
                });
                yield superAdmin.save();
                res.status(201).json({ message: 'Super Admin created successfully' });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    // User Login
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield users_1.default.findOne({ email }).select('+password'); // Include password in query
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const isMatch = yield bcryptjs_1.default.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                const token = jsonwebtoken_1.default.sign({ id: user._id, isSuperAdmin: user.isSuperAdmin, isAdministrator: user.isAdministrator }, _config_1.SECRET_KEY, {
                    expiresIn: '7d',
                });
                res.json({ message: 'Login successful', token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isSuperAdmin: user.isSuperAdmin, isAdministrator: user.isAdministrator } });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    // Update user password
    updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { oldPassword, newPassword } = req.body;
                const user = req.user;
                // Always fetch fresh user from DB with password included
                const userFromDb = yield users_1.default.findById(user._id).select('+password');
                if (!userFromDb) {
                    return res.status(404).json({ message: 'User not found' });
                }
                console.log(userFromDb.password);
                const isMatch = yield bcryptjs_1.default.compare(oldPassword, userFromDb.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Old password is incorrect' });
                }
                userFromDb.password = yield bcryptjs_1.default.hash(newPassword, 10);
                yield userFromDb.save();
                res.json({ message: 'Password updated successfully' });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    // Get all users (only superadmins can do this)
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestingUser = req.user;
                if (!requestingUser.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can view all users' });
                }
                const users = yield users_1.default.find().select('-password -__v');
                res.json(users);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    // Get one users (only superadmins can do this)
    getOneUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestingUser = req.user;
                const { userId } = req.params;
                if (!requestingUser.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can view all users' });
                }
                const user = yield users_1.default.findById(userId).select('-password -__v');
                res.json(user);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    grantPermission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can grant permissions' });
                }
                const { userId } = req.params;
                const { department } = req.body;
                if (!Object.values(users_1.Department).includes(department)) {
                    return res.status(400).json({ message: 'Invalid department' });
                }
                const user = yield users_1.default.findById(userId);
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                if (!user.modules.includes(department)) {
                    user.modules.push(department);
                    yield user.save();
                }
                res.json({ message: 'Permission granted', user });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Revoke Permission (Remove Department from User's Modules)
    revokePermission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can revoke permissions' });
                }
                const { userId } = req.params;
                const { department } = req.body;
                if (!Object.values(users_1.Department).includes(department)) {
                    return res.status(400).json({ message: 'Invalid department' });
                }
                const user = yield users_1.default.findById(userId);
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                user.modules = user.modules.filter(mod => mod !== department);
                yield user.save();
                res.json({ message: 'Permission revoked', user });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Update User Info
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can update users' });
                }
                const { userId } = req.params;
                const updates = req.body;
                const user = yield users_1.default.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                res.json({ message: 'User updated', user });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Delete User
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can delete users' });
                }
                const { userId } = req.params;
                const user = yield users_1.default.findByIdAndDelete(userId);
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                res.json({ message: 'User deleted successfully' });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    //Make User an Administrator
    makeAdministrator(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can make users admin' });
                }
                const { userId } = req.params;
                const user = yield users_1.default.findById(userId);
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                user.isAdministrator = true;
                user.save();
                res.json({ message: 'User now Administrator' });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    //Remove User as Administrator
    removeAdministrator(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user.isSuperAdmin) {
                    return res.status(403).json({ message: 'Only super admins can delete users' });
                }
                const { userId } = req.params;
                const user = yield users_1.default.findById(userId);
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                user.isAdministrator = false;
                user.save();
                res.json({ message: 'User now Administrator' });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
}
exports.default = new UserController();
