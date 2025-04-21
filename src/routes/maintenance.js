"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("@middlewares/authMiddleware");
const maintenanceController_1 = __importDefault(require("@controllers/fleetController/maintenanceController"));
const router = (0, express_1.Router)();
// Maintenance routes
router.post('/maintenance', authMiddleware_1.authMiddleware, maintenanceController_1.default.scheduleMaintenance);
router.patch('/maintenance/:maintenanceId/status', authMiddleware_1.authMiddleware, maintenanceController_1.default.updateMaintenanceStatus);
router.get('/maintenance/vehicle/:vehicleId', authMiddleware_1.authMiddleware, maintenanceController_1.default.getMaintenanceHistory);
router.get('/maintenance/upcoming', authMiddleware_1.authMiddleware, maintenanceController_1.default.getUpcomingMaintenance);
exports.default = router;
