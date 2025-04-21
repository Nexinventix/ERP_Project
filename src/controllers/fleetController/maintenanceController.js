"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fleet_1 = require("@models/fleet");
class MaintenanceController {
    // Schedule maintenance
    scheduleMaintenance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vehicleId, type, description, scheduledDate, mileage, cost, parts, nextMaintenanceDate, nextMaintenanceMileage } = req.body;
                const vehicle = yield fleet_1.Vehicle.findById(vehicleId);
                if (!vehicle) {
                    return res.status(404).json({ message: 'Vehicle not found' });
                }
                const maintenance = new fleet_1.Maintenance({
                    vehicle: vehicleId,
                    type,
                    description,
                    scheduledDate,
                    mileage,
                    cost,
                    parts,
                    status: 'scheduled',
                    nextMaintenanceDate,
                    nextMaintenanceMileage
                });
                yield maintenance.save();
                // Update vehicle maintenance schedule
                vehicle.maintenanceSchedule.push(maintenance._id);
                yield vehicle.save();
                res.status(201).json({ message: 'Maintenance scheduled successfully', maintenance });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Update maintenance status
    updateMaintenanceStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { maintenanceId, status, completedDate, actualCost } = req.body;
                if (!['scheduled', 'in-progress', 'completed'].includes(status)) {
                    return res.status(400).json({ message: 'Invalid status' });
                }
                const maintenance = yield fleet_1.Maintenance.findById(maintenanceId);
                if (!maintenance) {
                    return res.status(404).json({ message: 'Maintenance record not found' });
                }
                maintenance.status = status;
                if (status === 'completed') {
                    maintenance.completedDate = completedDate || new Date();
                    maintenance.cost = actualCost || maintenance.cost;
                }
                yield maintenance.save();
                // If maintenance is completed, update vehicle status
                if (status === 'completed') {
                    yield fleet_1.Vehicle.findByIdAndUpdate(maintenance.vehicle, {
                        status: 'active'
                    });
                }
                res.json({ message: 'Maintenance status updated', maintenance });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get vehicle maintenance history
    getMaintenanceHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vehicleId } = req.params;
                const maintenance = yield fleet_1.Maintenance.find({ vehicle: vehicleId })
                    .sort({ scheduledDate: -1 });
                res.json(maintenance);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get upcoming maintenance
    getUpcomingMaintenance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const maintenance = yield fleet_1.Maintenance.find({
                    status: { $in: ['scheduled', 'in-progress'] },
                    scheduledDate: { $gte: new Date() }
                })
                    .populate('vehicle')
                    .sort({ scheduledDate: 1 });
                res.json(maintenance);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Send alerts for due maintenance
    sendDueMaintenanceAlerts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dueMaintenance = yield fleet_1.Maintenance.find({
                    status: 'scheduled',
                    scheduledDate: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }).populate('vehicle');
                // Create notifications for each due maintenance
                const Notification = (yield Promise.resolve().then(() => __importStar(require('@models/notification')))).default;
                for (const maintenance of dueMaintenance) {
                    if (maintenance.vehicle && maintenance.vehicle._id) {
                        // Safe access for plateNumber
                        let plateNumber = '';
                        if (typeof maintenance.vehicle === 'object' && maintenance.vehicle !== null && 'plateNumber' in maintenance.vehicle) {
                            plateNumber = maintenance.vehicle.plateNumber;
                        }
                        yield Notification.create({
                            vehicle: maintenance.vehicle._id,
                            type: 'maintenance_due',
                            message: `Maintenance is due for vehicle ${plateNumber} on ${maintenance.scheduledDate.toDateString()}`,
                        });
                    }
                }
                // console.log(`Created notifications for ${dueMaintenance.length} maintenance tasks due tomorrow`);
                return dueMaintenance;
            }
            catch (error) {
                console.error('Error sending maintenance alerts:', error);
                throw error;
            }
        });
    }
}
exports.default = new MaintenanceController();
