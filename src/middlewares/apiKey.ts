import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

import {
    API_KEY_1, 
    API_KEY_2 
 } from '@config'

 const API_KEYS = new Set([
    API_KEY_1, // Store keys in environment variables
    API_KEY_2  // Add multiple keys if needed
]);

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void=> {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    logger.warn('API key missing');
    res.status(401).json({ 
      message: 'API key required',
      docs: 'Please include x-api-key header or api_key query parameter'
    });
    return
  }

  if (!API_KEYS.has(apiKey as string)) {
    logger.warn(`Invalid API key attempt. Received: ${apiKey} | Valid keys: ${Array.from(API_KEYS)}`);
    res.status(403).json({ 
      message: 'Invalid API key',
      docs: 'Contact support to obtain a valid API key'
    });
    return
  }

  next();
};