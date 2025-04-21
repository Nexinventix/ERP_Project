"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("@/middlewares/authMiddleware");
const users_1 = __importDefault(require("@controllers/users"));
const express = require('express');
const router = express.Router();
router.post('/login', users_1.default.login);
router.patch('/update-password', authMiddleware_1.authMiddleware, users_1.default.updatePassword);
// Super Admin Routes
router.post('/create-user', authMiddleware_1.authMiddleware, users_1.default.createUser);
router.post('/create-superadmin', authMiddleware_1.authMiddleware, users_1.default.createSuperAdmin);
router.get('/users', authMiddleware_1.authMiddleware, users_1.default.getAllUsers);
router.post('/signup-superadmin', users_1.default.signupSuperAdmin);
// New Super Admin Features
router.patch('/update-user/:userId', authMiddleware_1.authMiddleware, users_1.default.updateUser);
router.delete('/delete-user/:userId', authMiddleware_1.authMiddleware, users_1.default.deleteUser);
router.patch('/grant-permissions/:userId', authMiddleware_1.authMiddleware, users_1.default.grantPermission);
router.patch('/revoke-permissions/:userId', authMiddleware_1.authMiddleware, users_1.default.revokePermission);
router.patch('/make-admin/:userId', authMiddleware_1.authMiddleware, users_1.default.makeAdministrator);
router.patch('/remove-admin/:userId', authMiddleware_1.authMiddleware, users_1.default.removeAdministrator);
// router.get('/finance-data', 
//     authMiddleware, 
//     UserController.hasModuleAccess(Module.FINANCE), 
//     financeController.getData
//   );
exports.default = router;
