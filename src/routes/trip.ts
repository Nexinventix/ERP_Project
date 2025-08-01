import { Router } from 'express';
import { AuthenticatedRequestHandler } from '../types/express';
import { authMiddleware } from '../middlewares/authMiddleware';
import TripController from '../controllers/fleetController/tripController';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { Permission } from '../models/users';

const router = Router();

// Trip routes
router.post('/trips', authMiddleware, permissionMiddleware([Permission.CREATE_TRIP]), TripController.createTrip as AuthenticatedRequestHandler);
router.patch('/trips/:tripId/status', authMiddleware, permissionMiddleware([Permission.EDIT_TRIP]), TripController.updateTripStatus as AuthenticatedRequestHandler);
router.get('/trips', authMiddleware,  TripController.getAllTrips as AuthenticatedRequestHandler);
router.get('/trips/vehicle/:vehicleId', authMiddleware, TripController.getVehicleTrips as AuthenticatedRequestHandler);
router.get('/trips/driver/:driverId', authMiddleware, TripController.getDriverTrips as AuthenticatedRequestHandler);
router.get('/trips/statistics', authMiddleware, TripController.getTripStatistics as AuthenticatedRequestHandler);

export default router;
