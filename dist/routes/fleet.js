"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fleetSetUpConfig_1 = __importDefault(require("../controllers/fleetController/fleetSetUpConfig"));
const securityMiddleware_1 = require("../middlewares/securityMiddleware");
const multer_1 = require("../utils/multer");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const users_1 = require("../models/users");
const router = (0, express_1.Router)();
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
router.post('/vehicles', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.ADD_ASSET_VEHICLE]), multer_1.upload.any(), securityMiddleware_1.validateVehicleInput, fleetSetUpConfig_1.default.addVehicle);
// Assign vehicle to driver (or department)
router.patch('/vehicles/:vehicleId/assign', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.ASSIGN_VEHICLE]), securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicle);
// Update vehicle status
router.patch('/vehicles/:vehicleId/status', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.EDIT_DRIVER]), // EDIT_DRIVER used for vehicle status edits; adjust if you have a more specific permission
securityMiddleware_1.validateVehicleStatus, fleetSetUpConfig_1.default.updateVehicleStatus);
// View all vehicles
router.get('/vehicles', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.VIEW_FLEET_MODULE]), fleetSetUpConfig_1.default.getAllVehicles);
// Assign vehicle to projects
router.patch('/vehicles/:vehicleId/assign-project', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.ASSIGN_VEHICLE]), securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicleToProjects);
// Assign vehicle to clients
router.patch('/vehicles/:vehicleId/assign-client', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.ASSIGN_VEHICLE]), securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicleToClients);
// Assign vehicle to locations
router.patch('/vehicles/:vehicleId/assign-location', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.ASSIGN_VEHICLE]), securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicleToLocations);
// Search vehicles by name or registration number
router.get('/vehicles/search', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.VIEW_FLEET_MODULE]), securityMiddleware_1.validateVehicleSearch, fleetSetUpConfig_1.default.searchVehicles);
// Debug endpoint to check vehicles in database
router.get('/vehicles/debug', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.VIEW_FLEET_MODULE]), fleetSetUpConfig_1.default.debugVehicles);
exports.default = router;
