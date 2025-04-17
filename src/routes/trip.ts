import { Router } from 'express';
import { AuthenticatedRequestHandler } from '../types/express';
import { authMiddleware } from '@middlewares/authMiddleware';
import TripController from '@controllers/fleetController/tripController';

const router = Router();

// Trip routes
router.post('/trips', authMiddleware, TripController.createTrip as AuthenticatedRequestHandler);
router.patch('/trips/:tripId/status', authMiddleware, TripController.updateTripStatus as AuthenticatedRequestHandler);
router.get('/trips', authMiddleware, TripController.getAllTrips as AuthenticatedRequestHandler);
router.get('/trips/vehicle/:vehicleId', authMiddleware, TripController.getVehicleTrips as AuthenticatedRequestHandler);
router.get('/trips/driver/:driverId', authMiddleware, TripController.getDriverTrips as AuthenticatedRequestHandler);
router.get('/trips/statistics', authMiddleware, TripController.getTripStatistics as AuthenticatedRequestHandler);

export default router;
