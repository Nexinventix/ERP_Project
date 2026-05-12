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
class InfoGraphicsController {
    overviewGraph(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const AllVehicles = yield fleet_1.Vehicle.countDocuments();
                const AllMaintenance = yield fleet_1.Maintenance.countDocuments();
                const AllDrivers = yield fleet_1.Driver.countDocuments();
                const AllTrips = yield fleet_1.Trip.countDocuments();
                res.status(200).json({ message: "overview info", data: [{ name: 'Total Fleets', value: AllVehicles, color: '#6366F1' }, { name: 'Drivers', value: AllDrivers, color: '#EF4444' }, { name: 'Trips', value: AllTrips, color: '#4ADE80' }, { name: 'Maintenance', value: AllMaintenance, color: '#FB923C' }] });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    mileageTracking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const result = yield fleet_1.Trip.aggregate([{ $group: {
                            _id: null,
                            totalDistance: { $sum: "$distance" }
                        } }]);
                const total = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalDistance) || 0;
                const monthlyResult = yield fleet_1.Trip.aggregate([{
                        $group: { _id: { month: { $month: "$startTime" }, year: { $year: "$startTime" } }, value: { $sum: "$distance" } }
                    }, { $sort: { "_id.year": 1, "_id.month": 1 } }]);
                const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthlyBreakdown = monthlyResult.map(item => {
                    const { month, year } = item._id;
                    return {
                        name: `${MONTH_NAMES[month - 1]} ${year}`,
                        value: item.value
                    };
                });
                res.status(200).json({ Mileage: total, monthly: monthlyBreakdown });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    fuelExpenses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const totalResult = yield fleet_1.FuelLog.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalCost: { $sum: "$totalCost" }
                        }
                    }
                ]);
                const totalFuelCost = ((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.totalCost) || 0;
                const monthlyResult = yield fleet_1.FuelLog.aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $year: "$date" },
                                month: { $month: "$date" }
                            },
                            value: { $sum: "$totalCost" }
                        }
                    },
                    {
                        $sort: { "_id.year": 1, "_id.month": 1 }
                    }
                ]);
                const monthlyBreakdown = monthlyResult.map(item => {
                    const { year, month } = item._id;
                    return {
                        name: `${MONTH_NAMES[month - 1]} ${year}`,
                        value: item.value
                    };
                });
                res.status(200).json({
                    totalFuelCost,
                    monthlyBreakdown
                });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    getFuelUsageStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const totalResult = yield fleet_1.FuelLog.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalQuantity: { $sum: "$quantity" }
                        }
                    }
                ]);
                const totalQuantity = ((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.totalQuantity) || 0;
                const monthlyResult = yield fleet_1.FuelLog.aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $year: "$date" },
                                month: { $month: "$date" }
                            },
                            value: { $sum: "$quantity" }
                        }
                    },
                    {
                        $sort: { "_id.year": 1, "_id.month": 1 }
                    }
                ]);
                const monthlyBreakdown = monthlyResult.map(item => {
                    const { year, month } = item._id;
                    return {
                        name: `${MONTH_NAMES[month - 1]} ${year}`,
                        value: item.value
                    };
                });
                res.status(200).json({
                    totalFuelUsed: totalQuantity,
                    monthlyBreakdown
                });
            }
            catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            }
        });
    }
    ;
}
exports.default = new InfoGraphicsController();
