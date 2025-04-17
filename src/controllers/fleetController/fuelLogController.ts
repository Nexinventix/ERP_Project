import { Request, Response } from 'express';
import { FuelLog, Vehicle } from '@models/fleet';
import { User } from '@models/users';

interface AuthenticatedRequest extends Request {
  user: User;
}

class FuelLogController {
  // Add fuel log
  async addFuelLog(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        vehicleId,
        driverId,
        location,
        fuelType,
        quantity,
        costPerUnit,
        mileage
      } = req.body;

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      const totalCost = quantity * costPerUnit;
      const fuelEfficiency = mileage / quantity; // km/L or miles/gallon

      const fuelLog = new FuelLog({
        vehicle: vehicleId,
        driver: driverId,
        date: new Date(),
        location,
        fuelType,
        quantity,
        costPerUnit,
        totalCost,
        mileage,
        fuelEfficiency
      });

      await fuelLog.save();

      // Add fuel log to vehicle's records
      vehicle.fuelLogs.push(fuelLog._id);
      await vehicle.save();

      res.status(201).json({ message: 'Fuel log added successfully', fuelLog });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get vehicle fuel logs
  async getVehicleFuelLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const { vehicleId } = req.params;
      const fuelLogs = await FuelLog.find({ vehicle: vehicleId })
        .populate('driver')
        .sort({ date: -1 });

      res.json(fuelLogs);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get fuel consumption report
  async getFuelConsumptionReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { startDate, endDate, vehicleId } = req.query;
      
      const query: any = {};
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }
      if (vehicleId) {
        query.vehicle = vehicleId;
      }

      const fuelLogs = await FuelLog.find(query)
        .populate('vehicle')
        .populate('driver');

      const report = {
        totalFuelConsumption: fuelLogs.reduce((sum, log) => sum + log.quantity, 0),
        totalCost: fuelLogs.reduce((sum, log) => sum + log.totalCost, 0),
        averageEfficiency: fuelLogs.reduce((sum, log) => sum + log.fuelEfficiency, 0) / (fuelLogs.length || 1),
        byVehicle: {} as { [key: string]: any }
      };

      // Group by vehicle
      fuelLogs.forEach(log => {
        const vehicleId = log.vehicle._id.toString();
        if (!report.byVehicle[vehicleId]) {
          report.byVehicle[vehicleId] = {
            vehicleInfo: log.vehicle,
            totalConsumption: 0,
            totalCost: 0,
            logs: []
          };
        }
        report.byVehicle[vehicleId].totalConsumption += log.quantity;
        report.byVehicle[vehicleId].totalCost += log.totalCost;
        report.byVehicle[vehicleId].logs.push(log);
      });

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get fuel efficiency trends
  async getFuelEfficiencyTrends(req: AuthenticatedRequest, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { period = 'monthly' } = req.query;

      const fuelLogs = await FuelLog.find({ vehicle: vehicleId })
        .sort({ date: 1 });

      const trends: { [key: string]: any } = {};

      fuelLogs.forEach(log => {
        let key;
        if (period === 'monthly') {
          key = log.date.toISOString().substring(0, 7); // YYYY-MM
        } else if (period === 'weekly') {
          const date = new Date(log.date);
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - date.getDay()); // Start of week
          key = date.toISOString().substring(0, 10); // YYYY-MM-DD
        } else {
          key = log.date.toISOString().substring(0, 10); // YYYY-MM-DD
        }

        if (!trends[key]) {
          trends[key] = {
            totalEfficiency: 0,
            count: 0,
            totalConsumption: 0,
            totalCost: 0
          };
        }

        trends[key].totalEfficiency += log.fuelEfficiency;
        trends[key].count += 1;
        trends[key].totalConsumption += log.quantity;
        trends[key].totalCost += log.totalCost;
      });

      // Calculate averages
      Object.keys(trends).forEach(key => {
        trends[key].averageEfficiency = trends[key].totalEfficiency / trends[key].count;
      });

      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }
}

export default new FuelLogController();
