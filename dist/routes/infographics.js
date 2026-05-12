"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const infographics_1 = __importDefault(require("../controllers/fleetController/infographics"));
const router = express_1.default.Router();
/**
 * GET /fuel/expenses
 * Returns total fuel cost and monthly cost breakdown
 */
router.get("/info/fuel/expenses", infographics_1.default.fuelExpenses);
/**
 * GET /fuel/usage
 * Returns total fuel quantity and monthly usage breakdown
 */
router.get("/info/fuel/usage", infographics_1.default.getFuelUsageStats);
router.get("/info/overview", infographics_1.default.overviewGraph);
router.get("/info/mileage/info", infographics_1.default.mileageTracking);
exports.default = router;
