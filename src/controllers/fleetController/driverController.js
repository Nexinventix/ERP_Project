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
const fleet_1 = require("@models/fleet");
const cloudinary_1 = require("@utils/cloudinary");
const mongodb_1 = require("mongodb");
class DriverController {
    // Add new driver
    addDriver(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, licenseNumber, licenseExpiry, contact, address } = req.body;
                // Handle certification uploads (req.files) similar to vehicle
                const certificationsData = [];
                let files = [];
                if (Array.isArray(req.files)) {
                    files = req.files;
                }
                else if (req.files && typeof req.files === 'object') {
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
                        documentPath: yield (0, cloudinary_1.uploadToCloudinary)(file),
                        issueDate,
                        expiryDate
                    });
                }
                // console.log('req.body:', req.body);
                // console.log('req.files:', req.files);
                const driver = new fleet_1.Driver({
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
                yield driver.save();
                res.status(201).json({ message: 'Driver added successfully', driver });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Assign driver to vehicle
    assignToVehicle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { driverId, vehicleId } = req.params;
                const driver = yield fleet_1.Driver.findById(driverId);
                if (!driver) {
                    return res.status(404).json({ message: 'Driver not found' });
                }
                const vehicle = yield fleet_1.Vehicle.findById(vehicleId);
                if (!vehicle) {
                    return res.status(404).json({ message: 'Vehicle not found' });
                }
                // Update driver's assigned vehicle
                driver.assignedVehicle = new mongodb_1.ObjectId(vehicleId);
                yield driver.save();
                // Update vehicle's current driver
                vehicle.currentDriver = new mongodb_1.ObjectId(driverId);
                yield vehicle.save();
                res.json({ message: 'Driver assigned to vehicle successfully', driver, vehicle });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Update driver status
    updateDriverStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { driverId, status } = req.params;
                if (!['available', 'on-trip', 'off-duty', 'suspended'].includes(status)) {
                    return res.status(400).json({ message: 'Invalid status' });
                }
                const driver = yield fleet_1.Driver.findByIdAndUpdate(driverId, { status }, { new: true });
                if (!driver) {
                    return res.status(404).json({ message: 'Driver not found' });
                }
                res.json({ message: 'Driver status updated', driver });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Update performance metrics
    updatePerformanceMetrics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { driverId, safetyScore, fuelEfficiency, customerRating } = req.body;
                const driver = yield fleet_1.Driver.findById(driverId);
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
                yield driver.save();
                res.json({ message: 'Performance metrics updated', driver });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get all drivers
    getAllDrivers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const drivers = yield fleet_1.Driver.find()
                    .populate('assignedVehicle');
                res.json(drivers);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get driver details
    getDriverDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { driverId } = req.params;
                const driver = yield fleet_1.Driver.findById(driverId)
                    .populate('assignedVehicle');
                if (!driver) {
                    return res.status(404).json({ message: 'Driver not found' });
                }
                res.json(driver);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
}
exports.default = new DriverController();
