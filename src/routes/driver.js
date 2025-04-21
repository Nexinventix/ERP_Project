"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("@middlewares/authMiddleware");
const driverController_1 = __importDefault(require("@controllers/fleetController/driverController"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// Driver routes
router.post('/drivers', upload.any(), authMiddleware_1.authMiddleware, driverController_1.default.addDriver);
router.patch('/drivers/:driverId/:vehicleId', authMiddleware_1.authMiddleware, driverController_1.default.assignToVehicle);
router.patch('/drivers/:driverId/status', authMiddleware_1.authMiddleware, driverController_1.default.updateDriverStatus);
router.patch('/drivers/:driverId/performance', authMiddleware_1.authMiddleware, driverController_1.default.updatePerformanceMetrics);
router.get('/drivers', authMiddleware_1.authMiddleware, driverController_1.default.getAllDrivers);
router.get('/drivers/:driverId', authMiddleware_1.authMiddleware, driverController_1.default.getDriverDetails);
exports.default = router;
