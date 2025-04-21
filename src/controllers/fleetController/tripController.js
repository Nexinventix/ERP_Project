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
class TripController {
    // Create new trip
    createTrip(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vehicleId, driverId, startLocation, endLocation, startTime, distance, cargo, passengers, revenue } = req.body;
                // Verify vehicle and driver availability
                const vehicle = yield fleet_1.Vehicle.findById(vehicleId);
                if (!vehicle) {
                    return res.status(404).json({ message: 'Vehicle not found' });
                }
                if (vehicle.status !== 'active') {
                    return res.status(400).json({ message: 'Vehicle is not available' });
                }
                const driver = yield fleet_1.Driver.findById(driverId);
                if (!driver) {
                    return res.status(404).json({ message: 'Driver not found' });
                }
                if (driver.status !== 'available') {
                    return res.status(400).json({ message: 'Driver is not available' });
                }
                const trip = new fleet_1.Trip({
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
                yield trip.save();
                // Update driver and vehicle status
                driver.status = 'on-trip';
                yield driver.save();
                res.status(201).json({ message: 'Trip created successfully', trip });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Update trip status
    updateTripStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tripId, status, endTime } = req.body;
                if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
                    return res.status(400).json({ message: 'Invalid status' });
                }
                const trip = yield fleet_1.Trip.findById(tripId);
                if (!trip) {
                    return res.status(404).json({ message: 'Trip not found' });
                }
                trip.status = status;
                if (status === 'completed') {
                    trip.endTime = endTime || new Date();
                }
                yield trip.save();
                // Update driver status if trip is completed or cancelled
                if (status === 'completed' || status === 'cancelled') {
                    yield fleet_1.Driver.findByIdAndUpdate(trip.driver, { status: 'available' });
                }
                res.json({ message: 'Trip status updated', trip });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get all trips
    getAllTrips(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trips = yield fleet_1.Trip.find()
                    .populate('vehicle')
                    .populate('driver')
                    .sort({ startTime: -1 });
                res.json(trips);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get vehicle trips
    getVehicleTrips(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vehicleId } = req.params;
                const trips = yield fleet_1.Trip.find({ vehicle: vehicleId })
                    .populate('driver')
                    .sort({ startTime: -1 });
                res.json(trips);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get driver trips
    getDriverTrips(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { driverId } = req.params;
                const trips = yield fleet_1.Trip.find({ driver: driverId })
                    .populate('vehicle')
                    .sort({ startTime: -1 });
                res.json(trips);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    // Get trip statistics
    getTripStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                const query = {};
                if (startDate && endDate) {
                    query.startTime = {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    };
                }
                const trips = yield fleet_1.Trip.find(query);
                const statistics = {
                    totalTrips: trips.length,
                    completedTrips: trips.filter(t => t.status === 'completed').length,
                    cancelledTrips: trips.filter(t => t.status === 'cancelled').length,
                    totalRevenue: trips.reduce((sum, trip) => sum + trip.revenue, 0),
                    totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
                };
                res.json(statistics);
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
}
exports.default = new TripController();
