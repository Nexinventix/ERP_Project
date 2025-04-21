"use strict";
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
exports.Insurance = exports.GPSData = exports.FuelLog = exports.Maintenance = exports.Trip = exports.Driver = exports.Vehicle = exports.Department = exports.VehicleType = void 0;
const mongoose_1 = require("mongoose");
var VehicleType;
(function (VehicleType) {
    VehicleType["BIKE"] = "Bike";
    VehicleType["CAR"] = "Car";
    VehicleType["BUS"] = "Bus";
    VehicleType["TRUCK"] = "Truck";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var Department;
(function (Department) {
    Department["CUSTOMER_SERVICE_PRICING"] = "Customer service & Pricing";
    Department["SALES_FLEET"] = "Sales Fleet";
    Department["COURIER"] = "Courier";
    Department["HR_ADMIN"] = "HR & Admin";
    Department["FINANCE"] = "Finance";
    Department["AIR_SEA_OPERATIONS"] = "Air & Sea operations";
})(Department || (exports.Department = Department = {}));
// Schemas
const VehicleSchema = new mongoose_1.Schema({
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
                validator: function (v) {
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Driver',
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!v)
                        return true; // Allow null/undefined
                    const driver = yield exports.Driver.findById(v);
                    return driver !== null;
                });
            },
            message: 'Assigned driver does not exist'
        }
    },
    maintenanceSchedule: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Maintenance',
            validate: {
                validator: function (v) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!v)
                            return true;
                        const maintenance = yield exports.Maintenance.findById(v);
                        return maintenance !== null;
                    });
                },
                message: 'Invalid maintenance record'
            }
        }],
    fuelLogs: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'FuelLog',
            validate: {
                validator: function (v) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!v)
                            return true;
                        const fuelLog = yield exports.FuelLog.findById(v);
                        return fuelLog !== null;
                    });
                },
                message: 'Invalid fuel log record'
            }
        }],
    repairLogs: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Maintenance',
            validate: {
                validator: function (v) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!v)
                            return true;
                        const repair = yield exports.Maintenance.findById(v);
                        return repair !== null;
                    });
                },
                message: 'Invalid repair record'
            }
        }],
    gpsData: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'GPSData',
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!v)
                        return true;
                    const gps = yield exports.GPSData.findById(v);
                    return gps !== null;
                });
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
                    validator: function (v) {
                        return v <= new Date();
                    },
                    message: 'Issue date cannot be in the future'
                }
            },
            expiryDate: {
                type: Date,
                required: [true, 'Expiry date is required'],
                validate: {
                    validator: function (v) {
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
const DriverSchema = new mongoose_1.Schema({
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
                validator: function (v) {
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
                    validator: function (v) {
                        return v <= new Date();
                    },
                    message: 'Issue date cannot be in the future'
                }
            },
            expiryDate: {
                type: Date,
                required: [true, 'Expiry date is required'],
                validate: {
                    validator: function (v) {
                        return v > this.issueDate;
                    },
                    message: 'Expiry date must be after issue date'
                }
            }
        }],
    assignedVehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!v)
                        return true;
                    const vehicle = yield exports.Vehicle.findById(v);
                    return vehicle !== null;
                });
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
const TripSchema = new mongoose_1.Schema({
    vehicle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Driver', required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: Date,
    distance: {
        type: Number,
        required: [true, 'Distance is required'],
        min: [0, 'Distance cannot be negative'],
        validate: {
            validator: function (v) {
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
        }
    },
    passengers: {
        type: Number,
        min: [0, 'Number of passengers cannot be negative'],
        max: [500, 'Number of passengers cannot exceed 500']
    },
    revenue: {
        type: Number,
        required: [true, 'Revenue is required'],
        min: [0, 'Revenue cannot be negative'],
        validate: {
            validator: function (v) {
                return Number.isFinite(v);
            },
            message: 'Revenue must be a valid number'
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
const MaintenanceSchema = new mongoose_1.Schema({
    vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required'],
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    const vehicle = yield exports.Vehicle.findById(v);
                    return vehicle !== null;
                });
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
            validator: function (v) {
                return v >= new Date(Date.now() - 24 * 60 * 60 * 1000); // Cannot be more than 24 hours in the past
            },
            message: 'Scheduled date cannot be more than 24 hours in the past'
        }
    },
    completedDate: {
        type: Date,
        validate: {
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
                return Number.isFinite(v);
            },
            message: 'Cost must be a valid number'
        }
    },
    parts: [{
            partId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'SparePart',
                required: [true, 'Part ID is required'],
                validate: {
                    validator: function (v) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const SparePart = (0, mongoose_1.model)('SparePart');
                            const part = yield SparePart.findById(v);
                            return part !== null;
                        });
                    },
                    message: 'Invalid part reference'
                }
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required'],
                min: [1, 'Quantity must be at least 1'],
                validate: {
                    validator: function (v) {
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
                    validator: function (v) {
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
            validator: function (v) {
                return !v || v > this.scheduledDate;
            },
            message: 'Next maintenance date must be after current maintenance date'
        }
    },
    nextMaintenanceMileage: {
        type: Number,
        validate: {
            validator: function (v) {
                return !v || (v > this.mileage && Number.isFinite(v));
            },
            message: 'Next maintenance mileage must be greater than current mileage'
        }
    }
}, { timestamps: true });
const FuelLogSchema = new mongoose_1.Schema({
    vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required'],
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    const vehicle = yield exports.Vehicle.findById(v);
                    return vehicle !== null;
                });
            },
            message: 'Invalid vehicle reference'
        }
    },
    driver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Driver',
        required: [true, 'Driver is required'],
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    const driver = yield exports.Driver.findById(v);
                    return driver !== null;
                });
            },
            message: 'Invalid driver reference'
        }
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        validate: {
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
                return Number.isFinite(v);
            },
            message: 'Fuel efficiency must be a valid number'
        }
    }
}, { timestamps: true });
const GPSDataSchema = new mongoose_1.Schema({
    vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required'],
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    const vehicle = yield exports.Vehicle.findById(v);
                    return vehicle !== null;
                });
            },
            message: 'Invalid vehicle reference'
        }
    },
    timestamp: {
        type: Date,
        required: [true, 'Timestamp is required'],
        validate: {
            validator: function (v) {
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
                validator: function (v) {
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
                validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
                return Number.isFinite(v);
            },
            message: 'Fuel level must be a valid number'
        }
    }
});
const InsuranceSchema = new mongoose_1.Schema({
    vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required'],
        validate: {
            validator: function (v) {
                return __awaiter(this, void 0, void 0, function* () {
                    const vehicle = yield exports.Vehicle.findById(v);
                    return vehicle !== null;
                });
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
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
DriverSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const driver = this;
        if (driver.personalInfo.licenseExpiry < new Date()) {
            throw new Error('Driver license has expired');
        }
        next();
    });
});
exports.Vehicle = (0, mongoose_1.model)('Vehicle', VehicleSchema);
exports.Driver = (0, mongoose_1.model)('Driver', DriverSchema);
exports.Trip = (0, mongoose_1.model)('Trip', TripSchema);
exports.Maintenance = (0, mongoose_1.model)('Maintenance', MaintenanceSchema);
exports.FuelLog = (0, mongoose_1.model)('FuelLog', FuelLogSchema);
exports.GPSData = (0, mongoose_1.model)('GPSData', GPSDataSchema);
exports.Insurance = (0, mongoose_1.model)('Insurance', InsuranceSchema);
exports.default = {
    Vehicle: exports.Vehicle,
    Driver: exports.Driver,
    Trip: exports.Trip,
    Maintenance: exports.Maintenance,
    FuelLog: exports.FuelLog,
    GPSData: exports.GPSData,
    Insurance: exports.Insurance
};
