"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tripController_1 = __importDefault(require("../controllers/fleetController/tripController"));
const permission_middleware_1 = require("../middlewares/permission.middleware");
const users_1 = require("../models/users");
const router = (0, express_1.Router)();
// Trip routes
router.post('/trips', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.CREATE_TRIP]), tripController_1.default.createTrip);
// Search trips by various criteria
router.get('/trips/search', authMiddleware_1.authMiddleware, tripController_1.default.searchTrips);
router.patch('/trips/:tripId/status', authMiddleware_1.authMiddleware, (0, permission_middleware_1.permissionMiddleware)([users_1.Permission.EDIT_TRIP]), tripController_1.default.updateTripStatus);
router.get('/trips', authMiddleware_1.authMiddleware, tripController_1.default.getAllTrips);
router.get('/trips/vehicle/:vehicleId', authMiddleware_1.authMiddleware, tripController_1.default.getVehicleTrips);
router.get('/trips/driver/:driverId', authMiddleware_1.authMiddleware, tripController_1.default.getDriverTrips);
router.get('/trips/statistics', authMiddleware_1.authMiddleware, tripController_1.default.getTripStatistics);
router.get('/trips/:tripId', authMiddleware_1.authMiddleware, tripController_1.default.getSingleTrip);
exports.default = router;
