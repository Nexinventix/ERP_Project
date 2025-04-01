import { authMiddleware } from "@/middlewares/authMiddleware";
import UserController from "@controllers/users"

const express = require('express')
const router = express.Router()

router.post('/login', UserController.login);
router.put('/update-password', authMiddleware, UserController.updatePassword);

// Super Admin Routes
router.post('/create-user', authMiddleware, UserController.createUser);
router.post('/create-superadmin', authMiddleware, UserController.createSuperAdmin);
router.get('/users', authMiddleware, UserController.getAllUsers);
router.post('/signup-superadmin', UserController.signupSuperAdmin);

// New Super Admin Features
router.put('/update-user/:userId', authMiddleware, UserController.updateUser);
router.delete('/delete-user/:userId', authMiddleware, UserController.deleteUser);
router.put('/grant-permissions/:userId', authMiddleware, UserController.grantPermission);
router.put('/revoke-permissions/:userId', authMiddleware, UserController.revokePermission);

// router.get('/finance-data', 
//     authMiddleware, 
//     UserController.hasModuleAccess(Module.FINANCE), 
//     financeController.getData
//   );

export default router