import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import FleetController from '../controllers/fleetController/fleetSetUpConfig';
import { validateVehicleInput, validateAssignVehicle, validateVehicleStatus } from '../middlewares/securityMiddleware';
import { upload } from '../utils/multer';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { Permission } from '../models/users';

const router = Router();

// =====================
// ORIGINAL FLEET ROUTES (commented for reference)
// =====================
/*
// Fleet management routes
router.post('/vehicles', 
    authMiddleware, 
    upload.any(), // Allow any file fields, for flexible certification uploads
    validateVehicleInput,
    FleetController.addVehicle
);

router.patch('/vehicles/:vehicleId/assign', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicle
);

router.patch('/vehicles/:vehicleId/status', 
    authMiddleware,
    validateVehicleStatus,
    FleetController.updateVehicleStatus
);

router.get('/vehicles', 
    authMiddleware, 
    FleetController.getAllVehicles
);

router.patch('/vehicles/:vehicleId/assign-project', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicleToProjects
);

router.patch('/vehicles/:vehicleId/assign-client', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicleToClients
);

router.patch('/vehicles/:vehicleId/assign-location', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicleToLocations
);
*/

// =====================
// UPDATED ROUTES WITH PERMISSION MIDDLEWARE
// =====================

// Add vehicle
router.post(
  '/vehicles',
  authMiddleware,
  permissionMiddleware([Permission.ADD_ASSET_VEHICLE]),
  upload.any(),
  validateVehicleInput,
  FleetController.addVehicle
);

// Assign vehicle to driver (or department)
router.patch(
  '/vehicles/:vehicleId/assign',
  authMiddleware,
  permissionMiddleware([Permission.ASSIGN_VEHICLE]),
  validateAssignVehicle,
  FleetController.assignVehicle
);

// Update vehicle status
router.patch(
  '/vehicles/:vehicleId/status',
  authMiddleware,
  permissionMiddleware([Permission.EDIT_DRIVER]), // EDIT_DRIVER used for vehicle status edits; adjust if you have a more specific permission
  validateVehicleStatus,
  FleetController.updateVehicleStatus
);

// View all vehicles
router.get(
  '/vehicles',
  authMiddleware,
  permissionMiddleware([Permission.VIEW_FLEET_MODULE]),
  FleetController.getAllVehicles
);

// Assign vehicle to projects
router.patch(
  '/vehicles/:vehicleId/assign-project',
  authMiddleware,
  permissionMiddleware([Permission.ASSIGN_VEHICLE]),
  validateAssignVehicle,
  FleetController.assignVehicleToProjects
);

// Assign vehicle to clients
router.patch(
  '/vehicles/:vehicleId/assign-client',
  authMiddleware,
  permissionMiddleware([Permission.ASSIGN_VEHICLE]),
  validateAssignVehicle,
  FleetController.assignVehicleToClients
);

// Assign vehicle to locations
router.patch(
  '/vehicles/:vehicleId/assign-location',
  authMiddleware,
  permissionMiddleware([Permission.ASSIGN_VEHICLE]),
  validateAssignVehicle,
  FleetController.assignVehicleToLocations
);

export default router;
