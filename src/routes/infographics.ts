import express from "express";
import InfoGraphicsController from "@/controllers/fleetController/infographics";

const router = express.Router();

/**
 * GET /fuel/expenses
 * Returns total fuel cost and monthly cost breakdown
 */
router.get("/info/fuel/expenses", InfoGraphicsController.fuelExpenses);

/**
 * GET /fuel/usage
 * Returns total fuel quantity and monthly usage breakdown
 */
router.get("/info/fuel/usage", InfoGraphicsController.getFuelUsageStats);
router.get("/info/overview", InfoGraphicsController.overviewGraph)
router.get("/info/mileage/info", InfoGraphicsController.mileageTracking)

export default router;
