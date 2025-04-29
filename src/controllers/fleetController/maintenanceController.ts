import { Request, Response } from 'express';
import { Maintenance, Vehicle } from '../../models/fleet';
import { User } from '../../models/users';

interface AuthenticatedRequest extends Request {
  user: User;
}

class MaintenanceController {
  // Schedule maintenance
  async scheduleMaintenance(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        vehicleId,
        type,
        description,
        scheduledDate,
        mileage,
        cost,
        parts,
        nextMaintenanceDate,
        nextMaintenanceMileage
      } = req.body;

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      const maintenance = new Maintenance({
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

      await maintenance.save();

      // Update vehicle maintenance schedule
      vehicle.maintenanceSchedule.push(maintenance._id);
      await vehicle.save();

      res.status(201).json({ message: 'Maintenance scheduled successfully', maintenance });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Update maintenance status
  async updateMaintenanceStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { maintenanceId, status, completedDate, actualCost } = req.body;

      if (!['scheduled', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const maintenance = await Maintenance.findById(maintenanceId);
      if (!maintenance) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      maintenance.status = status;
      if (status === 'completed') {
        maintenance.completedDate = completedDate || new Date();
        maintenance.cost = actualCost || maintenance.cost;
      }

      await maintenance.save();

      // If maintenance is completed, update vehicle status
      if (status === 'completed') {
        await Vehicle.findByIdAndUpdate(maintenance.vehicle, {
          status: 'active'
        });
      }

      res.json({ message: 'Maintenance status updated', maintenance });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get vehicle maintenance history
  async getMaintenanceHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { vehicleId } = req.params;
      const maintenance = await Maintenance.find({ vehicle: vehicleId })
        .sort({ scheduledDate: -1 });

      res.json(maintenance);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get upcoming maintenance
  async getUpcomingMaintenance(req: AuthenticatedRequest, res: Response) {
    try {
      const maintenance = await Maintenance.find({
        status: { $in: ['scheduled', 'in-progress'] },
        scheduledDate: { $gte: new Date() }
      })
        .populate('vehicle')
        .sort({ scheduledDate: 1 });

      res.json(maintenance);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Send alerts for due maintenance
  async sendDueMaintenanceAlerts() {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueMaintenance = await Maintenance.find({
        status: 'scheduled',
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('vehicle');

      // Create notifications for each due maintenance
      const Notification = (await import('@models/notification')).default;
      for (const maintenance of dueMaintenance) {
        if (maintenance.vehicle && maintenance.vehicle._id) {
          // Safe access for plateNumber
          let plateNumber = '';
          if (typeof maintenance.vehicle === 'object' && maintenance.vehicle !== null && 'plateNumber' in maintenance.vehicle) {
            plateNumber = (maintenance.vehicle as any).plateNumber;
          }
          await Notification.create({
            vehicle: maintenance.vehicle._id,
            type: 'maintenance_due',
            message: `Maintenance is due for vehicle ${plateNumber} on ${maintenance.scheduledDate.toDateString()}`,
          });
        }
      }
      // console.log(`Created notifications for ${dueMaintenance.length} maintenance tasks due tomorrow`);
      
      return dueMaintenance;
    } catch (error) {
      console.error('Error sending maintenance alerts:', error);
      throw error;
    }
  }
}

export default new MaintenanceController();
