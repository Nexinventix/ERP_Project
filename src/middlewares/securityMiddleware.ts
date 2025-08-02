import { Request, Response, NextFunction, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

// Rate limiting configuration
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key].trim());
            }
        });
    }
    next();
};

// Validation middleware for vehicle routes
export const validateVehicleInput: RequestHandler[] = [
    body('make').trim().notEmpty().escape(),
    body('model').trim().notEmpty().escape(),
    body('registration').trim().notEmpty().matches(/^[A-Za-z0-9-]+$/),
    body('plateNumber').trim().notEmpty().matches(/^[A-Za-z0-9-]+$/),
    body('type').isIn(['Bike', 'Car', 'Truck', 'Van', 'Bus', 'Bicycle']),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        next();
    }
];

// Validation middleware for vehicle assignment
import { param } from 'express-validator';
import { Department } from '../models/fleet';

export const validateAssignVehicle: RequestHandler[] = [
    param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
    body('departments')
        .optional()
        .custom((value) => {
            if (!Array.isArray(value)) value = [value];
            for (const dep of value) {
                if (!Object.values(Department).includes(dep)) {
                    throw new Error(`Invalid department value: ${dep}`);
                }
            }
            return true;
        }),
    body('currentDriver').optional().isMongoId().withMessage('Invalid driver ID'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        next();
    }
];

// Validation middleware for vehicle status
export const validateVehicleStatus: RequestHandler[] = [
    body('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
    body('status')
        .isIn(['active', 'maintenance', 'repair', 'inactive'])
        .withMessage('Invalid vehicle status'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        next();
    }
];

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    // Don't expose error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ message: 'Internal server error' });
    } else {
        res.status(500).json({
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
