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

// router.get('/finance-data', 
//     authMiddleware, 
//     UserController.hasModuleAccess(Module.FINANCE), 
//     financeController.getData
//   );

export default router