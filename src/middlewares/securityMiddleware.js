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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.validateVehicleStatus = exports.validateAssignVehicle = exports.validateVehicleInput = exports.sanitizeInput = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_validator_1 = require("express-validator");
const xss_1 = __importDefault(require("xss"));
// Rate limiting configuration
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = (0, xss_1.default)(req.body[key].trim());
            }
        });
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// Validation middleware for vehicle routes
exports.validateVehicleInput = [
    (0, express_validator_1.body)('make').trim().notEmpty().escape(),
    (0, express_validator_1.body)('model').trim().notEmpty().escape(),
    (0, express_validator_1.body)('registration').trim().notEmpty().matches(/^[A-Za-z0-9-]+$/),
    (0, express_validator_1.body)('plateNumber').trim().notEmpty().matches(/^[A-Za-z0-9-]+$/),
    (0, express_validator_1.body)('type').isIn(['Bike', 'Car', 'Truck', 'Van']),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        next();
    })
];
// Validation middleware for vehicle assignment
const express_validator_2 = require("express-validator");
const fleet_1 = require("@models/fleet");
exports.validateAssignVehicle = [
    (0, express_validator_2.param)('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
    (0, express_validator_1.body)('departments')
        .optional()
        .custom((value) => {
        if (!Array.isArray(value))
            value = [value];
        for (const dep of value) {
            if (!Object.values(fleet_1.Department).includes(dep)) {
                throw new Error(`Invalid department value: ${dep}`);
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('currentDriver').optional().isMongoId().withMessage('Invalid driver ID'),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        next();
    })
];
// Validation middleware for vehicle status
exports.validateVehicleStatus = [
    (0, express_validator_1.body)('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
    (0, express_validator_1.body)('status')
        .isIn(['active', 'maintenance', 'repair', 'inactive'])
        .withMessage('Invalid vehicle status'),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        next();
    })
];
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    // Don't expose error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ message: 'Internal server error' });
    }
    else {
        res.status(500).json({
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
exports.errorHandler = errorHandler;
