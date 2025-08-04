import { Router } from 'express';
import multer from 'multer';
import { AuthenticatedRequestHandler } from '../types/express';
import { authMiddleware } from '../middlewares/authMiddleware';
import DriverController from '../controllers/fleetController/driverController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Driver routes
router.post('/drivers', upload.any(), authMiddleware, DriverController.addDriver as AuthenticatedRequestHandler);
router.patch('/drivers/:driverId/:vehicleId', authMiddleware, DriverController.assignToVehicle as AuthenticatedRequestHandler);
router.patch('/drivers/:driverId/status', authMiddleware, DriverController.updateDriverStatus as AuthenticatedRequestHandler);
router.patch('/drivers/:driverId/performance', authMiddleware, DriverController.updatePerformanceMetrics as AuthenticatedRequestHandler);
router.get('/drivers', authMiddleware, DriverController.getAllDrivers as AuthenticatedRequestHandler);

// Search drivers by name or license number - must come before :driverId route
router.get('/drivers/search', authMiddleware, DriverController.searchDrivers as AuthenticatedRequestHandler);

router.get('/drivers/:driverId', authMiddleware, DriverController.getDriverDetails as AuthenticatedRequestHandler);

// Debug endpoint to check drivers in database
router.get('/drivers/debug', authMiddleware, DriverController.debugDrivers as AuthenticatedRequestHandler);

export default router;
