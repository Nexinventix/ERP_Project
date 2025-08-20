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
        cost = 0,
        parts = [],
        nextMaintenanceDate,
        nextMaintenanceMileage
      } = req.body;

      // Validate required fields
      if (!vehicleId || !type || !scheduledDate || mileage === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate maintenance type
      if (!['scheduled', 'repair', 'emergency'].includes(type)) {
        return res.status(400).json({ message: 'Invalid maintenance type' });
      }

      // Validate dates
      const scheduledDateTime = new Date(scheduledDate);
      if (isNaN(scheduledDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid scheduled date' });
      }

      // Ensure scheduled date is in the future
      if (scheduledDateTime < new Date()) {
        return res.status(400).json({ message: 'Scheduled date must be in the future' });
      }

      // Validate next maintenance date if provided
      if (nextMaintenanceDate) {
        const nextDate = new Date(nextMaintenanceDate);
        if (isNaN(nextDate.getTime()) || nextDate <= scheduledDateTime) {
          return res.status(400).json({ 
            message: 'Next maintenance date must be after scheduled date' 
          });
        }
      }

      // Validate next maintenance mileage if provided
      if (nextMaintenanceMileage !== undefined && nextMaintenanceMileage <= mileage) {
        return res.status(400).json({ 
          message: 'Next maintenance mileage must be greater than current mileage' 
        });
      }

      // Validate parts array
      if (!Array.isArray(parts)) {
        return res.status(400).json({ message: 'Parts must be an array' });
      }

      // Validate each part in the parts array
      for (const part of parts) {
        if (!part.partId || !part.quantity) {
          return res.status(400).json({ 
            message: 'Each part must have partId and quantity' 
          });
        }
        if (isNaN(part.quantity) || part.quantity <= 0) {
          return res.status(400).json({ 
            message: 'Quantity must be a positive number' 
          });
        }
      }

      // Check if vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Check for duplicate maintenance scheduling
      const existingMaintenance = await Maintenance.findOne({
        vehicle: vehicleId,
        type,
        status: 'scheduled',
        scheduledDate: scheduledDateTime
      });

      if (existingMaintenance) {
        return res.status(409).json({ 
          message: 'Similar maintenance already scheduled for this vehicle',
          existingMaintenance
        });
      }

      // Create and save maintenance record
      const maintenance = new Maintenance({
        vehicle: vehicleId,
        type,
        description: description || '',
        scheduledDate: scheduledDateTime,
        mileage: Number(mileage),
        cost: Number(cost) || 0,
        parts: parts.map(p => ({
          partId: p.partId,
          quantity: Number(p.quantity),
          cost: Number(p.cost) || 0
        })),
        status: 'scheduled',
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : undefined,
        nextMaintenanceMileage: nextMaintenanceMileage ? Number(nextMaintenanceMileage) : undefined
      });

      await maintenance.save();

      // Update vehicle maintenance schedule
      vehicle.maintenanceSchedule.push(maintenance._id);
      await vehicle.save();

      res.status(201).json({ 
        success: true,
        message: 'Maintenance scheduled successfully', 
        data: maintenance 
      });
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to schedule maintenance' 
      });
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
      const Notification = (await import('../../models/notification')).default;
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
