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
const fleet_1 = require("../../models/fleet");
const cloudinary_1 = require("../../utils/cloudinary");
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
                const driverId = req.params.driverId;
                const status = req.query.status;
                // Validate driverId is a valid MongoDB ObjectId
                if (!mongodb_1.ObjectId.isValid(driverId)) {
                    return res.status(400).json({ message: 'Invalid driver ID format' });
                }
                // Validate status exists and is a valid value
                if (!status || typeof status !== 'string') {
                    return res.status(400).json({ message: 'Status is required and must be a string' });
                }
                if (!['available', 'on-trip', 'off-duty', 'suspended'].includes(status)) {
                    return res.status(400).json({ message: 'Invalid status value. Must be one of: available, on-trip, off-duty, suspended' });
                }
                const driver = yield fleet_1.Driver.findByIdAndUpdate(new mongodb_1.ObjectId(driverId), { status }, { new: true });
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
                // Pagination parameters
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                // Get total count for pagination
                const total = yield fleet_1.Driver.countDocuments();
                const totalPages = Math.ceil(total / limit);
                const drivers = yield fleet_1.Driver.find()
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
    // Search drivers by name or license number
    searchDrivers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query, page = 1, limit = 10 } = req.query;
                // Validate query parameter
                if (!query || typeof query !== 'string' || query.trim().length === 0) {
                    return res.status(400).json({ message: 'Search query is required and must be a non-empty string' });
                }
                // Pagination parameters
                const pageNum = parseInt(page) || 1;
                const limitNum = parseInt(limit) || 10;
                const skip = (pageNum - 1) * limitNum;
                // Create search query using regex for case-insensitive search
                // Remove quotes if they exist around the query
                const searchQuery = query.trim().replace(/^["']|["']$/g, '');
                const searchRegex = new RegExp(searchQuery, 'i');
                // Build the search filter
                const searchFilter = {
                    $or: [
                        { 'personalInfo.name': searchRegex },
                        { 'personalInfo.licenseNumber': searchRegex }
                    ]
                };
                // Debug: Log the search query and filter
                console.log('🔍 Driver Search Debug:', {
                    originalQuery: query,
                    cleanedQuery: searchQuery,
                    searchFilter,
                    searchRegex: searchRegex.toString()
                });
                // Get total count for pagination
                const total = yield fleet_1.Driver.countDocuments(searchFilter);
                const totalPages = Math.ceil(total / limitNum);
                // Debug: Log the count
                console.log('📊 Driver Search Results:', { total, totalPages });
                // Perform the search with pagination
                const drivers = yield fleet_1.Driver.find(searchFilter)
                    .skip(skip)
                    .limit(limitNum)
                    .populate('assignedVehicle')
                    .sort({ createdAt: -1 }); // Sort by newest first
                // Debug: Log the found drivers
                console.log('👨‍💼 Found Drivers:', drivers.length);
                if (drivers.length > 0) {
                    console.log('Sample driver:', {
                        name: drivers[0].personalInfo.name,
                        licenseNumber: drivers[0].personalInfo.licenseNumber
                    });
                }
                res.json({
                    data: drivers,
                    pagination: {
                        total,
                        page: pageNum,
                        totalPages,
                        limit: limitNum
                    }
                });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    deleteDriver(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { driverId } = req.params;
                const driver = yield fleet_1.Driver.findByIdAndDelete(new mongodb_1.ObjectId(driverId));
                if (!driver) {
                    return res.status(404).json({ message: 'Driver not found' });
                }
                res.json({ message: 'Driver deleted successfully', driver });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Debug method to check all drivers in database
    debugDrivers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allDrivers = yield fleet_1.Driver.find().limit(5);
                console.log('🔍 Debug: All drivers in database:', allDrivers.length);
                if (allDrivers.length > 0) {
                    console.log('Sample drivers:');
                    allDrivers.forEach((driver, index) => {
                        console.log(`${index + 1}. Name: "${driver.personalInfo.name}", License: "${driver.personalInfo.licenseNumber}"`);
                    });
                }
                res.json({
                    message: 'Debug info logged to console',
                    totalDrivers: allDrivers.length,
                    sampleDrivers: allDrivers.map(d => ({
                        name: d.personalInfo.name,
                        licenseNumber: d.personalInfo.licenseNumber,
                        contact: d.personalInfo.contact,
                        status: d.status
                    }))
                });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
}
exports.default = new DriverController();
