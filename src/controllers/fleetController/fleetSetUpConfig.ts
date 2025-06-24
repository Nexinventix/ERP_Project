import { Request, Response, RequestHandler, NextFunction } from 'express';
import { Vehicle, VehicleType, Department, ICertification } from '../../models/fleet';
import { User } from '../../models/users';
import { uploadToCloudinary } from '../../utils/cloudinary';
import multer from 'multer';

interface MulterRequest extends Request {
    files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

interface AuthenticatedRequest extends MulterRequest {
    user: User;
}

type AsyncRequestHandler = RequestHandler;

class FleetController {
  private sendResponse(res: Response, statusCode: number, data: any): void {
    res.status(statusCode).json(data);
  }
  // Add Fleet Information
  addVehicle: AsyncRequestHandler = async (req: MulterRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        make,
        model,
        registration,
        type,
        location,
        plateNumber,
        currentDriver,
        projects,
        clients,
        locations,
      } = req.body;

      // Validate vehicle type
      if (!Object.values(VehicleType).includes(type)) {
        this.sendResponse(res, 400, { message: 'Invalid vehicle type' });
        return;
      }

      // Normalize departments to always be an array
      let normalizedDepartments = req.body.departments;
      if (!Array.isArray(normalizedDepartments)) {
        if (normalizedDepartments) {
          normalizedDepartments = [normalizedDepartments];
        } else {
          normalizedDepartments = [];
        }
      }

      // Normalize projects, clients, locations to always be arrays
      const normalizedProjects = Array.isArray(projects) ? projects : projects ? [projects] : [];
      const normalizedClients = Array.isArray(clients) ? clients : clients ? [clients] : [];
      const normalizedLocations = Array.isArray(locations) ? locations : locations ? [locations] : [];

      // Handle certification uploads robustly for both array and object req.files
      const certificationsData: ICertification[] = [];
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
          this.sendResponse(res, 400, { message: `Certification "${certType}" must have both issueDate and expiryDate.` });
          return;
        }

        // Validate format
        const issueDate = new Date(issueDateRaw);
        const expiryDate = new Date(expiryDateRaw);
        if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
          this.sendResponse(res, 400, { message: `Certification "${certType}" has invalid date format.` });
          return;
        }

        certificationsData.push({
          type: certType,
          documentPath: await uploadToCloudinary(file),
          issueDate,
          expiryDate
        });
      }

      const vehicle = new Vehicle({
        make,
        model,
        registration,
        type,
        location,
        plateNumber,
        certifications: certificationsData,
        departments: normalizedDepartments,
        projects: normalizedProjects,
        clients: normalizedClients,
        locations: normalizedLocations,
        currentDriver,
        status: 'active'
      });

      const savedVehicle = await vehicle.save();
      res.status(201).json({ message: 'Vehicle added successfully', vehicle: savedVehicle });
    } catch (error) {
      this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }



  // Assign Fleet to Departments
  assignVehicle: AsyncRequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { departments, currentDriver } = req.body;
      const { vehicleId } = req.params;

      if (!req.user.isAdministrator) {
        this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
        return;
      }

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        this.sendResponse(res, 404, { message: 'Vehicle not found' });
        return;
      }

      if (departments) {
        vehicle.departments = Array.isArray(departments) ? departments : [departments];
      }
      if (currentDriver) vehicle.currentDriver = currentDriver;

      await vehicle.save();

      this.sendResponse(res, 200, { message: 'Vehicle assignment updated', vehicle });
      return;
    } catch (error) {
      this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }

  // Assign Fleet to Projects
  assignVehicleToProjects: AsyncRequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projects } = req.body;
      const { vehicleId } = req.params;

      if (!req.user.isAdministrator) {
        this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
        return;
      }

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        this.sendResponse(res, 404, { message: 'Vehicle not found' });
        return;
      }

      if (projects) {
        vehicle.projects = Array.isArray(projects) ? projects : [projects];
      }

      await vehicle.save();

      this.sendResponse(res, 200, { message: 'Vehicle projects updated', vehicle });
      return;
    } catch (error) {
      this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }

  // Assign Fleet to Clients
  assignVehicleToClients: AsyncRequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clients } = req.body;
      const { vehicleId } = req.params;

      if (!req.user.isAdministrator) {
        this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
        return;
      }

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        this.sendResponse(res, 404, { message: 'Vehicle not found' });
        return;
      }

      if (clients) {
        vehicle.clients = Array.isArray(clients) ? clients : [clients];
      }

      await vehicle.save();

      this.sendResponse(res, 200, { message: 'Vehicle clients updated', vehicle });
      return;
    } catch (error) {
      this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }

  // Assign Fleet to Locations
  assignVehicleToLocations: AsyncRequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { locations } = req.body;
      const { vehicleId } = req.params;

      if (!req.user.isAdministrator) {
        this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
        return;
      }

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        this.sendResponse(res, 404, { message: 'Vehicle not found' });
        return;
      }

      if (locations) {
        vehicle.locations = Array.isArray(locations) ? locations : [locations];
      }

      await vehicle.save();

      this.sendResponse(res, 200, { message: 'Vehicle locations updated', vehicle });
      return;
    } catch (error) {
      this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }

  getAllVehicles: AsyncRequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicles = await Vehicle.find()
        .populate('currentDriver')
        .populate('maintenanceSchedule')
        // .populate('insurance');
      this.sendResponse(res, 200, vehicles);
      return;
    } catch (error) {
      this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }

  updateVehicleStatus: AsyncRequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vehicleId, status } = req.body;
      
      if (!['active', 'maintenance', 'repair', 'inactive'].includes(status)) {
        this.sendResponse(res, 400, { message: 'Invalid status' });
        return;
      }

      const vehicle = await Vehicle.findByIdAndUpdate(
        vehicleId,
        { status },
        { new: true }
      );

      if (!vehicle) {
        this.sendResponse(res, 404, { message: 'Vehicle not found' });
        return;
      }

      this.sendResponse(res, 200, { message: 'Vehicle status updated', vehicle });
      return;
    } catch (error) {
      this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
      return;
    }
  }
}

export default new FleetController();
