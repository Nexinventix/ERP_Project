import { Router } from 'express';
import { authMiddleware } from '@middlewares/authMiddleware';
import FleetController from '@controllers/fleetController/fleetSetUpConfig';
import { validateVehicleInput, validateAssignVehicle, validateVehicleStatus } from '@middlewares/securityMiddleware';
import { upload } from '@utils/multer';

const router = Router();

// Fleet management routes
router.post('/vehicles', 
    authMiddleware, 
    upload.any(), // Allow any file fields, for flexible certification uploads
    validateVehicleInput,
    FleetController.addVehicle
);

router.patch('/vehicles/:vehicleId/assign', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicle
);

router.patch('/vehicles/:vehicleId/status', 
    authMiddleware,
    validateVehicleStatus,
    FleetController.updateVehicleStatus
);

router.get('/vehicles', 
    authMiddleware, 
    FleetController.getAllVehicles
);

router.patch('/vehicles/:vehicleId/assign-project', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicleToProjects
);

router.patch('/vehicles/:vehicleId/assign-client', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicleToClients
);

router.patch('/vehicles/:vehicleId/assign-location', 
    authMiddleware,
    validateAssignVehicle,
    FleetController.assignVehicleToLocations
);

export default router;
