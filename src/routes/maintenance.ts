import { Router } from 'express';
import { AuthenticatedRequestHandler } from '../types/express';
import { authMiddleware } from '../middlewares/authMiddleware';
import MaintenanceController from '../controllers/fleetController/maintenanceController';

const router = Router();

// Maintenance routes
router.post('/maintenance', authMiddleware, MaintenanceController.scheduleMaintenance as AuthenticatedRequestHandler);
router.patch('/maintenance/:maintenanceId/status', authMiddleware, MaintenanceController.updateMaintenanceStatus as AuthenticatedRequestHandler);
router.get('/maintenance/vehicle/:vehicleId', authMiddleware, MaintenanceController.getMaintenanceHistory as AuthenticatedRequestHandler);
router.get('/maintenance/upcoming', authMiddleware, MaintenanceController.getUpcomingMaintenance as AuthenticatedRequestHandler);

export default router;