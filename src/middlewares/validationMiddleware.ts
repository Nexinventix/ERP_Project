import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

export const validate = (validations: ValidationChain[]): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await Promise.all(validations.map(validation => validation.run(req)));
            const result = validationResult(req);
            if (result.isEmpty()) {
                next();
                return;
            }
            res.status(400).json({ errors: result.array() });
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
};
