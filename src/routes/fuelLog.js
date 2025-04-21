"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("@middlewares/authMiddleware");
const fuelLogController_1 = __importDefault(require("@controllers/fleetController/fuelLogController"));
const router = (0, express_1.Router)();
// Fuel log routes
router.post('/fuel-logs', authMiddleware_1.authMiddleware, fuelLogController_1.default.addFuelLog);
router.get('/fuel-logs/vehicle/:vehicleId', authMiddleware_1.authMiddleware, fuelLogController_1.default.getVehicleFuelLogs);
router.get('/fuel-logs/consumption', authMiddleware_1.authMiddleware, fuelLogController_1.default.getFuelConsumptionReport);
router.get('/fuel-logs/efficiency/:vehicleId', authMiddleware_1.authMiddleware, fuelLogController_1.default.getFuelEfficiencyTrends);
exports.default = router;
