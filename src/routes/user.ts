
import { authMiddleware } from "../middlewares/authMiddleware";
import UserController from "../controllers/users";
// import { permissionMiddleware } from "../middlewares/permission.middleware";
// import { Permission } from "../models/users";

const express = require('express')
const router = express.Router()


router.post('/login', UserController.login);
router.post('/signup-superadmin', UserController.signupSuperAdmin);

router.use(authMiddleware)
router.patch('/update-password', UserController.updatePassword);

// Super Admin Routes
router.post('/create-user', UserController.createUser);
router.post('/create-superadmin', UserController.createSuperAdmin);
router.get('/users', UserController.getAllUsers);


// New Super Admin Features
router.patch('/update-user/:userId', UserController.updateUser);
router.delete('/delete-user/:userId', UserController.deleteUser);
router.patch('/grant-permissions/:userId', UserController.grantPermission);
router.patch('/revoke-permissions/:userId', UserController.revokePermission);

router.patch('/make-admin/:userId', UserController.makeAdministrator);
router.patch('/remove-admin/:userId', UserController.removeAdministrator);

// router.get('/finance-data', 
//     authMiddleware, 
//     UserController.hasModuleAccess(Module.FINANCE), 
//     financeController.getData
//   );

export default router