"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("@middlewares/authMiddleware");
const fleetSetUpConfig_1 = __importDefault(require("@controllers/fleetController/fleetSetUpConfig"));
const securityMiddleware_1 = require("@middlewares/securityMiddleware");
const multer_1 = require("@utils/multer");
const router = (0, express_1.Router)();
// Fleet management routes
router.post('/vehicles', authMiddleware_1.authMiddleware, multer_1.upload.any(), // Allow any file fields, for flexible certification uploads
securityMiddleware_1.validateVehicleInput, fleetSetUpConfig_1.default.addVehicle);
router.patch('/vehicles/:vehicleId/assign', authMiddleware_1.authMiddleware, securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicle);
router.patch('/vehicles/:vehicleId/status', authMiddleware_1.authMiddleware, securityMiddleware_1.validateVehicleStatus, fleetSetUpConfig_1.default.updateVehicleStatus);
router.get('/vehicles', authMiddleware_1.authMiddleware, fleetSetUpConfig_1.default.getAllVehicles);
router.patch('/vehicles/:vehicleId/assign-project', authMiddleware_1.authMiddleware, securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicleToProjects);
router.patch('/vehicles/:vehicleId/assign-client', authMiddleware_1.authMiddleware, securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicleToClients);
router.patch('/vehicles/:vehicleId/assign-location', authMiddleware_1.authMiddleware, securityMiddleware_1.validateAssignVehicle, fleetSetUpConfig_1.default.assignVehicleToLocations);
exports.default = router;
