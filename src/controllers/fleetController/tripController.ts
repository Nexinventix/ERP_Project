import { Request, Response } from 'express';
import { Trip, Driver, Vehicle } from '../../models/fleet';
import { User } from '../../models/users';

interface AuthenticatedRequest extends Request {
  user: User;
}

class TripController {
  // Create new trip
  async createTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        vehicleId,
        driverId,
        startLocation,
        endLocation,
        startTime,
        distance,
        cargo,
        passengers,
        revenue
      } = req.body;

      // Verify vehicle and driver availability
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      if (vehicle.status !== 'active') {
        return res.status(400).json({ message: 'Vehicle is not available' });
      }

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      if (driver.status !== 'available') {
        return res.status(400).json({ message: 'Driver is not available' });
      }

      const trip = new Trip({
        vehicle: vehicleId,
        driver: driverId,
        startLocation,
        endLocation,
        startTime,
        distance,
        cargo,
        passengers,
        revenue,
        status: 'scheduled'
      });

      await trip.save();

      // Update driver and vehicle status
      driver.status = 'on-trip';
      await driver.save();

      res.status(201).json({ message: 'Trip created successfully', trip });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Update trip status
  async updateTripStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { tripId, status, endTime } = req.body;

      if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      trip.status = status;
      if (status === 'completed') {
        trip.endTime = endTime || new Date();
      }

      await trip.save();

      // Update driver status if trip is completed or cancelled
      if (status === 'completed' || status === 'cancelled') {
        await Driver.findByIdAndUpdate(trip.driver, { status: 'available' });
      }

      res.json({ message: 'Trip status updated', trip });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get all trips
  async getAllTrips(req: AuthenticatedRequest, res: Response) {
    try {
      const trips = await Trip.find()
        .populate('vehicle')
        .populate('driver')
        .sort({ startTime: -1 });

      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get vehicle trips
  async getVehicleTrips(req: AuthenticatedRequest, res: Response) {
    try {
      const { vehicleId } = req.params;
      const trips = await Trip.find({ vehicle: vehicleId })
        .populate('driver')
        .sort({ startTime: -1 });

      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get driver trips
  async getDriverTrips(req: AuthenticatedRequest, res: Response) {
    try {
      const { driverId } = req.params;
      const trips = await Trip.find({ driver: driverId })
        .populate('vehicle')
        .sort({ startTime: -1 });

      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get trip statistics
  async getTripStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      const query: any = {};
      if (startDate && endDate) {
        query.startTime = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const trips = await Trip.find(query);
      
      const statistics = {
        totalTrips: trips.length,
        completedTrips: trips.filter(t => t.status === 'completed').length,
        cancelledTrips: trips.filter(t => t.status === 'cancelled').length,
        totalRevenue: trips.reduce((sum, trip) => sum + trip.revenue, 0),
        totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
      };

      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }
}

export default new TripController();
