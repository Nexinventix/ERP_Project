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
class FleetController {
    constructor() {
        // Add Fleet Information
        this.addVehicle = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { make, model, registration, type, location, plateNumber, currentDriver, projects, clients, locations, } = req.body;
                // Validate vehicle type
                if (!Object.values(fleet_1.VehicleType).includes(type)) {
                    this.sendResponse(res, 400, { message: 'Invalid vehicle type' });
                    return;
                }
                // Normalize departments to always be an array
                let normalizedDepartments = req.body.departments;
                if (!Array.isArray(normalizedDepartments)) {
                    if (normalizedDepartments) {
                        normalizedDepartments = [normalizedDepartments];
                    }
                    else {
                        normalizedDepartments = [];
                    }
                }
                // Normalize projects, clients, locations to always be arrays
                const normalizedProjects = Array.isArray(projects) ? projects : projects ? [projects] : [];
                const normalizedClients = Array.isArray(clients) ? clients : clients ? [clients] : [];
                const normalizedLocations = Array.isArray(locations) ? locations : locations ? [locations] : [];
                // Handle certification uploads robustly for both array and object req.files
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
                        documentPath: yield (0, cloudinary_1.uploadToCloudinary)(file),
                        issueDate,
                        expiryDate
                    });
                }
                const vehicle = new fleet_1.Vehicle({
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
                const savedVehicle = yield vehicle.save();
                res.status(201).json({ message: 'Vehicle added successfully', vehicle: savedVehicle });
            }
            catch (error) {
                this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
                return;
            }
        });
        // Assign Fleet to Departments
        this.assignVehicle = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { departments, currentDriver } = req.body;
                const { vehicleId } = req.params;
                if (!req.user.isAdministrator) {
                    this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
                    return;
                }
                const vehicle = yield fleet_1.Vehicle.findById(vehicleId);
                if (!vehicle) {
                    this.sendResponse(res, 404, { message: 'Vehicle not found' });
                    return;
                }
                if (departments) {
                    vehicle.departments = Array.isArray(departments) ? departments : [departments];
                }
                if (currentDriver)
                    vehicle.currentDriver = currentDriver;
                yield vehicle.save();
                this.sendResponse(res, 200, { message: 'Vehicle assignment updated', vehicle });
                return;
            }
            catch (error) {
                this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
                return;
            }
        });
        // Assign Fleet to Projects
        this.assignVehicleToProjects = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { projects } = req.body;
                const { vehicleId } = req.params;
                if (!req.user.isAdministrator) {
                    this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
                    return;
                }
                const vehicle = yield fleet_1.Vehicle.findById(vehicleId);
                if (!vehicle) {
                    this.sendResponse(res, 404, { message: 'Vehicle not found' });
                    return;
                }
                if (projects) {
                    vehicle.projects = Array.isArray(projects) ? projects : [projects];
                }
                yield vehicle.save();
                this.sendResponse(res, 200, { message: 'Vehicle projects updated', vehicle });
                return;
            }
            catch (error) {
                this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
                return;
            }
        });
        // Assign Fleet to Clients
        this.assignVehicleToClients = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { clients } = req.body;
                const { vehicleId } = req.params;
                if (!req.user.isAdministrator) {
                    this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
                    return;
                }
                const vehicle = yield fleet_1.Vehicle.findById(vehicleId);
                if (!vehicle) {
                    this.sendResponse(res, 404, { message: 'Vehicle not found' });
                    return;
                }
                if (clients) {
                    vehicle.clients = Array.isArray(clients) ? clients : [clients];
                }
                yield vehicle.save();
                this.sendResponse(res, 200, { message: 'Vehicle clients updated', vehicle });
                return;
            }
            catch (error) {
                this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
                return;
            }
        });
        // Assign Fleet to Locations
        this.assignVehicleToLocations = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { locations } = req.body;
                const { vehicleId } = req.params;
                if (!req.user.isAdministrator) {
                    this.sendResponse(res, 403, { message: 'Not authorized to assign vehicles' });
                    return;
                }
                const vehicle = yield fleet_1.Vehicle.findById(vehicleId);
                if (!vehicle) {
                    this.sendResponse(res, 404, { message: 'Vehicle not found' });
                    return;
                }
                if (locations) {
                    vehicle.locations = Array.isArray(locations) ? locations : [locations];
                }
                yield vehicle.save();
                this.sendResponse(res, 200, { message: 'Vehicle locations updated', vehicle });
                return;
            }
            catch (error) {
                this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
                return;
            }
        });
        this.getAllVehicles = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const vehicles = yield fleet_1.Vehicle.find()
                    .populate('currentDriver')
                    .populate('maintenanceSchedule')
                    .populate('insurance');
                this.sendResponse(res, 200, vehicles);
                return;
            }
            catch (error) {
                this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
                return;
            }
        });
        this.updateVehicleStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { vehicleId, status } = req.body;
                if (!['active', 'maintenance', 'repair', 'inactive'].includes(status)) {
                    this.sendResponse(res, 400, { message: 'Invalid status' });
                    return;
                }
                const vehicle = yield fleet_1.Vehicle.findByIdAndUpdate(vehicleId, { status }, { new: true });
                if (!vehicle) {
                    this.sendResponse(res, 404, { message: 'Vehicle not found' });
                    return;
                }
                this.sendResponse(res, 200, { message: 'Vehicle status updated', vehicle });
                return;
            }
            catch (error) {
                this.sendResponse(res, 500, { message: error instanceof Error ? error.message : 'Server error' });
                return;
            }
        });
    }
    sendResponse(res, statusCode, data) {
        res.status(statusCode).json(data);
    }
}
exports.default = new FleetController();
