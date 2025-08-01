import { Request, Response } from 'express';
import { Driver, Vehicle } from '../../models/fleet';
import { User } from '../../models/users';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { ObjectId } from 'mongodb';

interface AuthenticatedRequest extends Request {
  user: User;
}

class DriverController {
  // Add new driver
  async addDriver(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        name,
        licenseNumber,
        licenseExpiry,
        contact,
        address
      } = req.body;

      // Handle certification uploads (req.files) similar to vehicle
      const certificationsData: any[] = [];
      let files: Express.Multer.File[] = [];
      if (Array.isArray(req.files)) {
        files = req.files;
      } else if (req.files && typeof req.files === 'object') {
        files = Object.values(req.files).flat();
      }
      for (const file of files) {
        const certType = file.fieldname;
        const issueDateRaw = req.body[`${certType}_issueDate`];
        const expiryDateRaw = req.body[`${certType}_expiryDate`];

        // Validate presence
        if (!issueDateRaw || !expiryDateRaw) {
          return res.status(400).json({ message: `Certification "${certType}" must have both issueDate and expiryDate.` });
        }

        // Validate format
        const issueDate = new Date(issueDateRaw);
        const expiryDate = new Date(expiryDateRaw);
        if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
          return res.status(400).json({ message: `Certification "${certType}" has invalid date format.` });
        }

        certificationsData.push({
          type: certType,
          documentPath: await uploadToCloudinary(file),
          issueDate,
          expiryDate
        });
      }
// console.log('req.body:', req.body);
// console.log('req.files:', req.files);
      const driver = new Driver({
        personalInfo: {
          name,
          licenseNumber,
          licenseExpiry,
          contact,
          address
        },
        certifications: certificationsData,
        performanceMetrics: {
          safetyScore: 0,
          fuelEfficiency: 0,
          customerRating: 0
        },
        status: 'available'
      });

      await driver.save();
      res.status(201).json({ message: 'Driver added successfully', driver });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Assign driver to vehicle
  async assignToVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const { driverId, vehicleId } = req.params;

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Update driver's assigned vehicle
      driver.assignedVehicle = new ObjectId(vehicleId);
      await driver.save();

      // Update vehicle's current driver
      vehicle.currentDriver = new ObjectId(driverId);
      await vehicle.save();

      res.json({ message: 'Driver assigned to vehicle successfully', driver, vehicle });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Update driver status
  async updateDriverStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { driverId, status } = req.params;

      if (!['available', 'on-trip', 'off-duty', 'suspended'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const driver = await Driver.findByIdAndUpdate(
        driverId,
        { status },
        { new: true }
      );

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      res.json({ message: 'Driver status updated', driver });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Update performance metrics
  async updatePerformanceMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const { driverId, safetyScore, fuelEfficiency, customerRating } = req.body;

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      if (safetyScore !== undefined) {
        driver.performanceMetrics.safetyScore = safetyScore;
      }
      if (fuelEfficiency !== undefined) {
        driver.performanceMetrics.fuelEfficiency = fuelEfficiency;
      }
      if (customerRating !== undefined) {
        driver.performanceMetrics.customerRating = customerRating;
      }

      await driver.save();
      res.json({ message: 'Performance metrics updated', driver });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get all drivers
  async getAllDrivers(req: AuthenticatedRequest, res: Response) {
    try {
      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await Driver.countDocuments();
      const totalPages = Math.ceil(total / limit);

      const drivers = await Driver.find()
        .skip(skip)
        .limit(limit)
        .populate('assignedVehicle');

      res.json({
        data: drivers,
        pagination: {
          total,
          page,
          totalPages,
          limit
        }
      });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get driver details
  async getDriverDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { driverId } = req.params;
      const driver = await Driver.findById(driverId)
        .populate('assignedVehicle');

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }
}

export default new DriverController();
