"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("@middlewares/authMiddleware");
const tripController_1 = __importDefault(require("@controllers/fleetController/tripController"));
const router = (0, express_1.Router)();
// Trip routes
router.post('/trips', authMiddleware_1.authMiddleware, tripController_1.default.createTrip);
router.patch('/trips/:tripId/status', authMiddleware_1.authMiddleware, tripController_1.default.updateTripStatus);
router.get('/trips', authMiddleware_1.authMiddleware, tripController_1.default.getAllTrips);
router.get('/trips/vehicle/:vehicleId', authMiddleware_1.authMiddleware, tripController_1.default.getVehicleTrips);
router.get('/trips/driver/:driverId', authMiddleware_1.authMiddleware, tripController_1.default.getDriverTrips);
router.get('/trips/statistics', authMiddleware_1.authMiddleware, tripController_1.default.getTripStatistics);
exports.default = router;
