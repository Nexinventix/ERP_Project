import { Router } from 'express';
import { AuthenticatedRequestHandler } from '../types/express';
import { authMiddleware } from '../middlewares/authMiddleware';
import FuelLogController from '../controllers/fleetController/fuelLogController';

const router = Router();

// Fuel log routes
router.post('/fuel-logs', authMiddleware, FuelLogController.addFuelLog as AuthenticatedRequestHandler);
router.get('/fuel-logs/vehicle/:vehicleId', authMiddleware, FuelLogController.getVehicleFuelLogs as AuthenticatedRequestHandler);
router.get('/fuel-logs/consumption', authMiddleware, FuelLogController.getFuelConsumptionReport as AuthenticatedRequestHandler);
router.get('/fuel-logs/efficiency/:vehicleId', authMiddleware, FuelLogController.getFuelEfficiencyTrends as AuthenticatedRequestHandler);

export default router;
