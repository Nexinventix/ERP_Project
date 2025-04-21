"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyMiddleware = void 0;
const logger_1 = require("@utils/logger");
const _config_1 = require("@config");
const API_KEYS = new Set([
    _config_1.API_KEY_1, // Store keys in environment variables
    _config_1.API_KEY_2 // Add multiple keys if needed
]);
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKey) {
        logger_1.logger.warn('API key missing');
        res.status(401).json({
            message: 'API key required',
            docs: 'Please include x-api-key header or api_key query parameter'
        });
        return;
    }
    if (!API_KEYS.has(apiKey)) {
        logger_1.logger.warn(`Invalid API key attempt. Received: ${apiKey} | Valid keys: ${Array.from(API_KEYS)}`);
        res.status(403).json({
            message: 'Invalid API key',
            docs: 'Contact support to obtain a valid API key'
        });
        return;
    }
    next();
};
exports.apiKeyMiddleware = apiKeyMiddleware;
