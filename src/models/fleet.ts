import { Schema, model, Document, Model, Types } from 'mongoose';

export enum VehicleType {
    BIKE = 'Bike',
    CAR = 'Car',
    BUS = 'Bus',
    TRUCK = 'Truck',
    VAN = 'Van',
    BICYCLE = 'Bicycle',
}

// export enum Department {
//     CUSTOMER_SERVICE_PRICING = 'Customer service & Pricing',
//     SALES_FLEET = 'Sales Fleet',
//     COURIER = 'Courier',
//     HR_ADMIN = 'HR & Admin',
//     FINANCE = 'Finance',
//     AIR_SEA_OPERATIONS = 'Air & Sea operations'
// }
export enum Department {
    FLEET = "Fleet",
    FINANCE = "Finance",
    LOGISTICS = "Logistics",
    CRM = "CRM",
    AIR_SEA_OPERATIONS = "Air & Sea Operations",
    PRICING_QUOTATION = "Pricing & Quotation",
  }

// Interfaces
export interface ICertification {
    _id?: Types.ObjectId;
    type: string;
    documentPath: string;
    issueDate: Date;
    expiryDate: Date;
}

export interface IVehicle {
    _id: Types.ObjectId;
    certifications: ICertification[];
    make: string;
    model: string;
    registration: string;
    type: VehicleType;
    location: string;
    plateNumber: string;
    departments: Department[];
    projects: string[];
    clients: string[];
    locations: string[];
    currentDriver?: Types.ObjectId;
    maintenanceSchedule: Types.ObjectId[];
    fuelLogs: Types.ObjectId[];
    repairLogs: Types.ObjectId[];
    gpsData?: Types.ObjectId;
    // insurance: Types.ObjectId;
    status: 'active' | 'maintenance' | 'repair' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export interface IDriver {
    _id: Types.ObjectId;
    personalInfo: {
        name: string;
        licenseNumber: string;
        licenseExpiry: Date;
        contact: string;
        address: string;
    };
    certifications: {
        type: string;
        issueDate: Date;
        expiryDate: Date;
    }[];
    assignedVehicle?: Types.ObjectId;
    performanceMetrics: {
        safetyScore: number;
        fuelEfficiency: number;
        customerRating: number;
    };
    status: 'available' | 'on-trip' | 'off-duty' | 'suspended';
}

export interface ITrip {
    _id: Types.ObjectId;
    vehicle: Types.ObjectId;
    driver: Types.ObjectId;
    client: Types.ObjectId;
    shipmentId: string;
    startLocation: string;
    endLocation: string;
    startTime: Date;
    endTime?: Date;
    distance: number;
    cargo?: {
        type: string;
        weight: number;
        description: string;
        numberOfPackages: number;
        fuelLiters: number;
        fuelCost: number;
        maintanceCost: number;
        tollFees: number;
        expectedRevenue: number;
        handlingInstructions: string;
    };
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface IMaintenance {
    _id: Types.ObjectId;
    vehicle: Types.ObjectId;
    type: 'scheduled' | 'repair' | 'emergency';
    description: string;
    scheduledDate: Date;
    completedDate?: Date;
    mileage: number;
    cost: number;
    parts: {
        partId: Types.ObjectId;
        quantity: number;
        cost: number;
    }[];
    status: 'scheduled' | 'in-progress' | 'completed';
    nextMaintenanceDate?: Date;
    nextMaintenanceMileage?: number;
}

export interface IFuelLog {
    _id: Types.ObjectId;
    vehicle: Types.ObjectId;
    driver: Types.ObjectId;
    date: Date;
    location: string;
    fuelType: string;
    quantity: number;
    costPerUnit: number;
    totalCost: number;
    mileage: number;
    fuelEfficiency: number;
}

export interface IGPSData {
    _id: Types.ObjectId;
    vehicle: Types.ObjectId;
    timestamp: Date;
    location: {
        latitude: number;
        longitude: number;
    };
    speed: number;
    direction: number;
    engineStatus: boolean;
    fuelLevel: number;
}

export interface IInsurance {
    _id: Types.ObjectId;
    vehicle: Types.ObjectId;
    policyNumber: string;
    provider: string;
    type: string;
    startDate: Date;
    expiryDate: Date;
    coverage: number;
    premium: number;
    status: 'active' | 'expired' | 'pending-renewal';
}

// Schemas
const VehicleSchema = new Schema<IVehicle>({
    make: { 
        type: String, 
        required: [true, 'Vehicle make is required'],
        trim: true,
        minlength: [2, 'Make must be at least 2 characters long'],
        maxlength: [50, 'Make cannot exceed 50 characters']
    },
    model: { 
        type: String, 
        required: [true, 'Vehicle model is required'],
        trim: true,
        minlength: [1, 'Model must be at least 1 character long'],
        maxlength: [50, 'Model cannot exceed 50 characters']
    },
    registration: { 
        type: String, 
        required: [true, 'Registration number is required'],
        unique: true, 
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9-]+$/, 'Registration number can only contain letters, numbers, and hyphens'],
        minlength: [4, 'Registration must be at least 4 characters long'],
        maxlength: [20, 'Registration cannot exceed 20 characters']
    },
    type: { 
        type: String, 
        enum: {
            values: Object.values(VehicleType),
            message: '{VALUE} is not a valid vehicle type'
        },
        required: [true, 'Vehicle type is required']
    },
    location: { 
        type: String, 
        required: [true, 'Location is required'],
        trim: true,
        minlength: [3, 'Location must be at least 3 characters long'],
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    plateNumber: { 
        type: String, 
        required: [true, 'Plate number is required'], 
        unique: true, 
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9-]+$/, 'Plate number can only contain letters, numbers, and hyphens'],
        minlength: [4, 'Plate number must be at least 4 characters long'],
        maxlength: [15, 'Plate number cannot exceed 15 characters']
    },
    departments: [{
        type: String,
        enum: {
            values: Object.values(Department),
            message: '{VALUE} is not a valid department'
        },
        validate: {
            validator: function(v: Department[]) {
                return v && v.length > 0;
            },
            message: 'At least one department must be assigned'
        }
    }],
    projects: [{
        type: String,
        trim: true
    }],
    clients: [{
        type: String,
        trim: true
    }],
    locations: [{
        type: String,
        trim: true
    }],
    currentDriver: { 
        type: Schema.Types.ObjectId, 
        ref: 'Driver',
        validate: {
            validator: async function(v: Types.ObjectId) {
                if (!v) return true; // Allow null/undefined
                const driver = await Driver.findById(v);
                return driver !== null;
            },
            message: 'Assigned driver does not exist'
        }
    },
    maintenanceSchedule: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Maintenance',
        validate: {
            validator: async function(v: Types.ObjectId) {
                if (!v) return true;
                const maintenance = await Maintenance.findById(v);
                return maintenance !== null;
            },
            message: 'Invalid maintenance record'
        }
    }],
    fuelLogs: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'FuelLog',
        validate: {
            validator: async function(v: Types.ObjectId) {
                if (!v) return true;
                const fuelLog = await FuelLog.findById(v);
                return fuelLog !== null;
            },
            message: 'Invalid fuel log record'
        }
    }],
    repairLogs: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Maintenance',
        validate: {
            validator: async function(v: Types.ObjectId) {
                if (!v) return true;
                const repair = await Maintenance.findById(v);
                return repair !== null;
            },
            message: 'Invalid repair record'
        }
    }],
    gpsData: { 
        type: Schema.Types.ObjectId, 
        ref: 'GPSData',
        validate: {
            validator: async function(v: Types.ObjectId) {
                if (!v) return true;
                const gps = await GPSData.findById(v);
                return gps !== null;
            },
            message: 'Invalid GPS data record'
        }
    },
    certifications: [{
        type: { 
            type: String, 
            required: [true, 'Certification type is required'],
            trim: true,
            minlength: [2, 'Certification type must be at least 2 characters long'],
            maxlength: [50, 'Certification type cannot exceed 50 characters']
        },
        documentPath: {
            type: String,
            required: [true, 'Certificate document is required']
        },
        issueDate: { 
            type: Date, 
            required: [true, 'Issue date is required'],
            validate: {
                validator: function(v: Date) {
                    return v <= new Date();
                },
                message: 'Issue date cannot be in the future'
            }
        },
        expiryDate: { 
            type: Date, 
            required: [true, 'Expiry date is required'],
            validate: {
                validator: function(this: any, v: Date) {
                    return v > this.issueDate;
                },
                message: 'Expiry date must be after issue date'
            }
        }
    }],
    status: { 
        type: String, 
        enum: {
            values: ['active', 'maintenance', 'repair', 'inactive'],
            message: '{VALUE} is not a valid status'
        },
        default: 'active',
        required: [true, 'Status is required']
    }
}, { timestamps: true });

const DriverSchema = new Schema<IDriver>({
    personalInfo: {
        name: { 
            type: String, 
            required: [true, 'Driver name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
            match: [/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes']
        },
        licenseNumber: { 
            type: String, 
            required: [true, 'License number is required'],
            unique: true,
            trim: true,
            uppercase: true,
            match: [/^[A-Z0-9-]+$/, 'License number can only contain letters, numbers, and hyphens'],
            minlength: [5, 'License number must be at least 5 characters long'],
            maxlength: [20, 'License number cannot exceed 20 characters']
        },
        licenseExpiry: { 
            type: Date, 
            required: [true, 'License expiry date is required'],
            validate: {
                validator: function(v: Date) {
                    return v > new Date();
                },
                message: 'License expiry date must be in the future'
            }
        },
        contact: { 
            type: String, 
            required: [true, 'Contact number is required'],
            trim: true,
            match: [/^\+?[0-9-\s()]+$/, 'Invalid contact number format'],
            minlength: [10, 'Contact number must be at least 10 characters long'],
            maxlength: [20, 'Contact number cannot exceed 20 characters']
        },
        address: { 
            type: String, 
            required: [true, 'Address is required'],
            trim: true,
            minlength: [5, 'Address must be at least 5 characters long'],
            maxlength: [200, 'Address cannot exceed 200 characters']
        }
    },
    certifications: [{
        type: { 
            type: String, 
            required: [true, 'Certification type is required'],
            trim: true,
            minlength: [2, 'Certification type must be at least 2 characters long'],
            maxlength: [50, 'Certification type cannot exceed 50 characters']
        },
        documentPath: {
            type: String,
            required: [true, 'Certificate document is required']
        },
        issueDate: { 
            type: Date, 
            required: [true, 'Issue date is required'],
            validate: {
                validator: function(v: Date) {
                    return v <= new Date();
                },
                message: 'Issue date cannot be in the future'
            }
        },
        expiryDate: { 
            type: Date, 
            required: [true, 'Expiry date is required'],
            validate: {
                validator: function(this: any, v: Date) {
                    return v > this.issueDate;
                },
                message: 'Expiry date must be after issue date'
            }
        }
    }],
    assignedVehicle: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vehicle',
        validate: {
            validator: async function(v: Types.ObjectId) {
                if (!v) return true;
                const vehicle = await Vehicle.findById(v);
                return vehicle !== null;
            },
            message: 'Invalid vehicle assignment'
        }
    },
    performanceMetrics: {
        safetyScore: { 
            type: Number, 
            default: 0,
            min: [0, 'Safety score cannot be negative'],
            max: [100, 'Safety score cannot exceed 100']
        },
        fuelEfficiency: { 
            type: Number, 
            default: 0,
            min: [0, 'Fuel efficiency cannot be negative'],
            max: [100, 'Fuel efficiency cannot exceed 100']
        },
        customerRating: { 
            type: Number, 
            default: 0,
            min: [0, 'Customer rating cannot be negative'],
            max: [5, 'Customer rating cannot exceed 5']
        }
    },
    status: { 
        type: String, 
        enum: {
            values: ['available', 'on-trip', 'off-duty', 'suspended'],
            message: '{VALUE} is not a valid status'
        },
        default: 'available',
        required: [true, 'Status is required']
    }
}, { timestamps: true });

const TripSchema = new Schema<ITrip>({
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    startLocation: { type: String, required: true },
    shipmentId: { type: String, required: true },
    endLocation: { type: String, required: true },
    startTime: { type: Date, required: true },

    endTime: Date,
    distance: { 
        type: Number, 
        required: [true, 'Distance is required'],
        min: [0, 'Distance cannot be negative'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Distance must be a valid number'
        }
    },
    cargo: {
        type: { 
            type: String,
            trim: true,
            maxlength: [50, 'Cargo type cannot exceed 50 characters']
        },
        weight: { 
            type: Number,
            min: [0, 'Weight cannot be negative'],
            max: [100000, 'Weight cannot exceed 100,000 kg']
        },
        description: { 
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters']
        },
        numberOfPackages: { 
            type: Number,
            min: [0, 'Number of packages cannot be negative'],
            // max: [100000, 'Number of packages cannot exceed 100,000']
        },
        fuelLiters: { 
            type: Number,
            min: [0, 'Fuel liters cannot be negative'],
            // max: [100000, 'Fuel liters cannot exceed 100,000']
        },
        fuelCost: { 
            type: Number,
            min: [0, 'Fuel cost cannot be negative'],
            // max: [100000, 'Fuel cost cannot exceed 100,000']
        },
        maintanceCost: { 
            type: Number,
            min: [0, 'Maintance cost cannot be negative'],
            // max: [100000, 'Maintance cost cannot exceed 100,000']
        },
        tollFees: { 
            type: Number,
            min: [0, 'Toll fees cannot be negative'],
            // max: [100000, 'Toll fees cannot exceed 100,000']
        },
        expectedRevenue: { 
            type: Number, 
            required: [true, 'Revenue is required'],
            min: [0, 'Revenue cannot be negative'],
            validate: {
                validator: function(v: number) {
                    return Number.isFinite(v);
                },
                message: 'Revenue must be a valid number'
            }
        },
        handlingInstructions: { 
            type: String,
            trim: true,
            maxlength: [500, 'Handling instructions cannot exceed 500 characters']
        }
    },
    status: { 
        type: String, 
        enum: {
            values: ['scheduled', 'in-progress', 'completed', 'cancelled'],
            message: '{VALUE} is not a valid status'
        },
        required: [true, 'Status is required'],
        default: 'scheduled'
    }
}, { timestamps: true });

const MaintenanceSchema = new Schema<IMaintenance>({
    vehicle: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: [true, 'Vehicle is required'],
        validate: {
            validator: async function(v: Types.ObjectId) {
                const vehicle = await Vehicle.findById(v);
                return vehicle !== null;
            },
            message: 'Invalid vehicle reference'
        }
    },
    type: { 
        type: String, 
        enum: {
            values: ['scheduled', 'repair', 'emergency'],
            message: '{VALUE} is not a valid maintenance type'
        },
        required: [true, 'Maintenance type is required']
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    scheduledDate: { 
        type: Date, 
        required: [true, 'Scheduled date is required'],
        validate: {
            validator: function(v: Date) {
                return v >= new Date(Date.now() - 24 * 60 * 60 * 1000); // Cannot be more than 24 hours in the past
            },
            message: 'Scheduled date cannot be more than 24 hours in the past'
        }
    },
    completedDate: { 
        type: Date,
        validate: {
            validator: function(this: any, v: Date) {
                return !v || v >= this.scheduledDate;
            },
            message: 'Completed date must be after or equal to scheduled date'
        }
    },
    mileage: { 
        type: Number, 
        required: [true, 'Mileage is required'],
        min: [0, 'Mileage cannot be negative'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Mileage must be a valid number'
        }
    },
    cost: { 
        type: Number, 
        required: [true, 'Cost is required'],
        min: [0, 'Cost cannot be negative'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Cost must be a valid number'
        }
    },
    parts: [{
        partId: { 
            type: Schema.Types.ObjectId, 
            ref: 'SparePart',
            required: [true, 'Part ID is required'],
            validate: {
                validator: async function(v: Types.ObjectId) {
                    const SparePart = model('SparePart');
                    const part = await SparePart.findById(v);
                    return part !== null;
                },
                message: 'Invalid part reference'
            }
        },
        quantity: { 
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
            validate: {
                validator: function(v: number) {
                    return Number.isInteger(v);
                },
                message: 'Quantity must be a whole number'
            }
        },
        cost: { 
            type: Number,
            required: [true, 'Part cost is required'],
            min: [0, 'Part cost cannot be negative'],
            validate: {
                validator: function(v: number) {
                    return Number.isFinite(v);
                },
                message: 'Part cost must be a valid number'
            }
        }
    }],
    status: { 
        type: String, 
        enum: {
            values: ['scheduled', 'in-progress', 'completed'],
            message: '{VALUE} is not a valid status'
        },
        required: [true, 'Status is required'],
        default: 'scheduled'
    },
    nextMaintenanceDate: { 
        type: Date,
        validate: {
            validator: function(this: any, v: Date) {
                return !v || v > this.scheduledDate;
            },
            message: 'Next maintenance date must be after current maintenance date'
        }
    },
    nextMaintenanceMileage: {
        type: Number,
        validate: {
            validator: function(this: any, v: number) {
                return !v || (v > this.mileage && Number.isFinite(v));
            },
            message: 'Next maintenance mileage must be greater than current mileage'
        }
    }
}, { timestamps: true });

const FuelLogSchema = new Schema<IFuelLog>({
    vehicle: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: [true, 'Vehicle is required'],
        validate: {
            validator: async function(v: Types.ObjectId) {
                const vehicle = await Vehicle.findById(v);
                return vehicle !== null;
            },
            message: 'Invalid vehicle reference'
        }
    },
    driver: { 
        type: Schema.Types.ObjectId, 
        ref: 'Driver', 
        required: [true, 'Driver is required'],
        validate: {
            validator: async function(v: Types.ObjectId) {
                const driver = await Driver.findById(v);
                return driver !== null;
            },
            message: 'Invalid driver reference'
        }
    },
    date: { 
        type: Date, 
        required: [true, 'Date is required'],
        validate: {
            validator: function(v: Date) {
                return v <= new Date();
            },
            message: 'Fuel log date cannot be in the future'
        }
    },
    location: { 
        type: String, 
        required: [true, 'Location is required'],
        trim: true,
        minlength: [3, 'Location must be at least 3 characters long'],
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    fuelType: { 
        type: String, 
        required: [true, 'Fuel type is required'],
        trim: true,
        enum: {
            values: ['Petrol', 'Diesel', 'Electric', 'CNG', 'LPG'],
            message: '{VALUE} is not a valid fuel type'
        }
    },
    quantity: { 
        type: Number, 
        required: [true, 'Quantity is required'],
        min: [0.1, 'Quantity must be greater than 0'],
        max: [1000, 'Quantity cannot exceed 1000 liters'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Quantity must be a valid number'
        }
    },
    costPerUnit: { 
        type: Number, 
        required: [true, 'Cost per unit is required'],
        min: [0, 'Cost per unit cannot be negative'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Cost per unit must be a valid number'
        }
    },
    totalCost: { 
        type: Number, 
        required: [true, 'Total cost is required'],
        min: [0, 'Total cost cannot be negative'],
        validate: {
            validator: function(this: any, v: number) {
                return v === this.quantity * this.costPerUnit;
            },
            message: 'Total cost must equal quantity multiplied by cost per unit'
        }
    },
    mileage: { 
        type: Number, 
        required: [true, 'Mileage is required'],
        min: [0, 'Mileage cannot be negative'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Mileage must be a valid number'
        }
    },
    fuelEfficiency: { 
        type: Number, 
        required: [true, 'Fuel efficiency is required'],
        min: [0, 'Fuel efficiency cannot be negative'],
        max: [100, 'Fuel efficiency cannot exceed 100 km/L'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Fuel efficiency must be a valid number'
        }
    }
}, { timestamps: true });

const GPSDataSchema = new Schema<IGPSData>({
    vehicle: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: [true, 'Vehicle is required'],
        validate: {
            validator: async function(v: Types.ObjectId) {
                const vehicle = await Vehicle.findById(v);
                return vehicle !== null;
            },
            message: 'Invalid vehicle reference'
        }
    },
    timestamp: { 
        type: Date, 
        required: [true, 'Timestamp is required'],
        validate: {
            validator: function(v: Date) {
                return v <= new Date();
            },
            message: 'GPS timestamp cannot be in the future'
        }
    },
    location: {
        latitude: { 
            type: Number, 
            required: [true, 'Latitude is required'],
            min: [-90, 'Latitude must be between -90 and 90 degrees'],
            max: [90, 'Latitude must be between -90 and 90 degrees'],
            validate: {
                validator: function(v: number) {
                    return Number.isFinite(v);
                },
                message: 'Latitude must be a valid number'
            }
        },
        longitude: { 
            type: Number, 
            required: [true, 'Longitude is required'],
            min: [-180, 'Longitude must be between -180 and 180 degrees'],
            max: [180, 'Longitude must be between -180 and 180 degrees'],
            validate: {
                validator: function(v: number) {
                    return Number.isFinite(v);
                },
                message: 'Longitude must be a valid number'
            }
        }
    },
    speed: { 
        type: Number, 
        required: [true, 'Speed is required'],
        min: [0, 'Speed cannot be negative'],
        max: [300, 'Speed cannot exceed 300 km/h'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Speed must be a valid number'
        }
    },
    direction: { 
        type: Number, 
        required: [true, 'Direction is required'],
        min: [0, 'Direction must be between 0 and 360 degrees'],
        max: [360, 'Direction must be between 0 and 360 degrees'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Direction must be a valid number'
        }
    },
    engineStatus: { 
        type: Boolean, 
        required: [true, 'Engine status is required']
    },
    fuelLevel: { 
        type: Number, 
        required: [true, 'Fuel level is required'],
        min: [0, 'Fuel level cannot be negative'],
        max: [100, 'Fuel level cannot exceed 100%'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Fuel level must be a valid number'
        }
    }
});

const InsuranceSchema = new Schema<IInsurance>({
    vehicle: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: [true, 'Vehicle is required'],
        validate: {
            validator: async function(v: Types.ObjectId) {
                const vehicle = await Vehicle.findById(v);
                return vehicle !== null;
            },
            message: 'Invalid vehicle reference'
        }
    },
    policyNumber: { 
        type: String, 
        required: [true, 'Policy number is required'],
        unique: true,
        trim: true,
        minlength: [5, 'Policy number must be at least 5 characters long'],
        maxlength: [50, 'Policy number cannot exceed 50 characters'],
        validate: {
            validator: function(v: string) {
                return /^[A-Za-z0-9-]+$/.test(v);
            },
            message: 'Policy number can only contain letters, numbers, and hyphens'
        }
    },
    provider: { 
        type: String, 
        required: [true, 'Provider is required'],
        trim: true,
        minlength: [2, 'Provider name must be at least 2 characters long'],
        maxlength: [100, 'Provider name cannot exceed 100 characters']
    },
    type: { 
        type: String, 
        required: [true, 'Insurance type is required'],
        trim: true,
        enum: {
            values: ['comprehensive', 'third-party', 'liability', 'collision'],
            message: '{VALUE} is not a valid insurance type'
        }
    },
    startDate: { 
        type: Date, 
        required: [true, 'Start date is required'],
        validate: {
            validator: function(v: Date) {
                const now = new Date();
                const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
                return v >= sixMonthsAgo;
            },
            message: 'Start date cannot be more than 6 months in the past'
        }
    },
    expiryDate: { 
        type: Date, 
        required: [true, 'Expiry date is required'],
        validate: {
            validator: function(this: any, v: Date) {
                return v > this.startDate;
            },
            message: 'Expiry date must be after start date'
        }
    },
    coverage: { 
        type: Number, 
        required: [true, 'Coverage amount is required'],
        min: [1000, 'Coverage must be at least 1000'],
        max: [10000000, 'Coverage cannot exceed 10 million'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Coverage must be a valid number'
        }
    },
    premium: { 
        type: Number, 
        required: [true, 'Premium amount is required'],
        min: [0, 'Premium cannot be negative'],
        validate: {
            validator: function(v: number) {
                return Number.isFinite(v);
            },
            message: 'Premium must be a valid number'
        }
    },
    status: { 
        type: String, 
        enum: {
            values: ['active', 'expired', 'pending-renewal'],
            message: '{VALUE} is not a valid status'
        },
        required: [true, 'Status is required'],
        default: 'active'
    }
}, { timestamps: true });

// Models
export type VehicleModel = Model<IVehicle, {}, {}, {}, Document<unknown, {}, IVehicle> & IVehicle>;
export type DriverModel = Model<IDriver, {}, {}, {}, Document<unknown, {}, IDriver> & IDriver>;
export type TripModel = Model<ITrip, {}, {}, {}, Document<unknown, {}, ITrip> & ITrip>;
export type MaintenanceModel = Model<IMaintenance, {}, {}, {}, Document<unknown, {}, IMaintenance> & IMaintenance>;
export type FuelLogModel = Model<IFuelLog, {}, {}, {}, Document<unknown, {}, IFuelLog> & IFuelLog>;
export type GPSDataModel = Model<IGPSData, {}, {}, {}, Document<unknown, {}, IGPSData> & IGPSData>;
export type InsuranceModel = Model<IInsurance, {}, {}, {}, Document<unknown, {}, IInsurance> & IInsurance>;

// Pre-save middleware to validate insurance expiry
// VehicleSchema.pre('save', async function(next) {
//     const vehicle = this;
//     const insurance = await Insurance.findById(vehicle.insurance);
//     if (insurance && insurance.expiryDate < new Date()) {
//         throw new Error('Vehicle insurance has expired');
//     }
//     next();
// });

// Pre-save middleware to validate license expiry
DriverSchema.pre('save', async function(next) {
    const driver = this;
    if (driver.personalInfo.licenseExpiry < new Date()) {
        throw new Error('Driver license has expired');
    }
    next();
});

export const Vehicle = model<IVehicle>('Vehicle', VehicleSchema) as VehicleModel;
export const Driver = model<IDriver>('Driver', DriverSchema) as DriverModel;
export const Trip = model<ITrip>('Trip', TripSchema) as TripModel;
export const Maintenance = model<IMaintenance>('Maintenance', MaintenanceSchema) as MaintenanceModel;
export const FuelLog = model<IFuelLog>('FuelLog', FuelLogSchema) as FuelLogModel;
export const GPSData = model<IGPSData>('GPSData', GPSDataSchema) as GPSDataModel;
export const Insurance = model<IInsurance>('Insurance', InsuranceSchema) as InsuranceModel;

export default {
    Vehicle,
    Driver,
    Trip,
    Maintenance,
    FuelLog,
    GPSData,
    Insurance
};