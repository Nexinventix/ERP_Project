import { Request, Response } from 'express';
import { Trip, Driver, Vehicle } from '../../models/fleet';
import  {Client} from '../../models/client'
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
        clientId,
        shipmentId,
        startLocation,
        endLocation,
        startTime,
        distance,
        numberOfPackages,
        fuelLiters,
        fuelCost,
        maintanceCost,
        tollFees,
        expectedRevenue,
        handlingInstructions
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

      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      const trip = new Trip({
        vehicle: vehicleId,
        driver: driverId,
        client: clientId,
        shipmentId,
        startLocation,
        endLocation,
        startTime,
        distance,
        cargo: {
          numberOfPackages,
          fuelLiters,
          fuelCost,
          maintanceCost,
          tollFees,
          expectedRevenue,
          handlingInstructions
        },
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
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [trips, total] = await Promise.all([
        Trip.find()
          .populate('vehicle')
          .populate('driver')
          .populate('client')
          .sort({ startTime: -1 })
          .skip(skip)
          .limit(limitNum),
        Trip.countDocuments()
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        data: trips,
        pagination: {
          total,
          page: pageNum,
          totalPages,
          limit: limitNum
        }
      });
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
        .populate('client')
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
        .populate('client')
        .sort({ startTime: -1 });

      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  async getSingleTrip(req:AuthenticatedRequest, res:Response){
    try{
      const tripId = req.params.tripId;

      const response = await Trip.findById(tripId).populate('driver').populate('client').populate('vehicle');
      res.json(response);
    }catch(error){
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
        totalRevenue: trips.reduce((sum, trip) => sum + (trip.cargo?.expectedRevenue || 0), 0),
        totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
      };

      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Search trips by various criteria
  async searchTrips(req: AuthenticatedRequest, res: Response) {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      
      // Validate query parameter
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ message: 'Search query is required and must be a non-empty string' });
      }

      // Pagination parameters
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Create search query using regex for case-insensitive search
      // Remove quotes if they exist around the query
      const searchQuery = query.trim().replace(/^["']|["']$/g, '');
      const searchRegex = new RegExp(searchQuery, 'i');

      // Build the search filter using $or with multiple conditions
      const searchFilter = {
        $or: [
          { 'shipmentId': searchRegex },
          // Search in vehicle fields
          { 'vehicle.plateNumber': searchRegex },
          { 'vehicle.model': searchRegex },
          { 'vehicle.type': searchRegex },
          // Search in driver fields
          { 'driver.personalInfo.name': searchRegex },
          // Search in client fields
          { 'client.name': searchRegex },
          { 'client.companyName': searchRegex },
          // Search in trip fields
          { 'startLocation': searchRegex },
          { 'endLocation': searchRegex }
        ]
      };

      // Perform the search with pagination and populate related fields
      const [trips, total] = await Promise.all([
        Trip.find(searchFilter)
          .populate({
            path: 'vehicle',
            select: 'model type plateNumber'
          })
          .populate({
            path: 'driver',
            select: 'personalInfo.name'
          })
          .populate({
            path: 'client',
            select: 'name companyName'
          })
          .skip(skip)
          .limit(limitNum)
          .sort({ startTime: -1 }),
        Trip.countDocuments(searchFilter)
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        data: trips,
        pagination: {
          total,
          page: pageNum,
          totalPages,
          limit: limitNum
        }
      });
    } catch (error) {
      console.error('Error searching trips:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Server error during trip search' 
      });
    }
  }
}

export default new TripController();
