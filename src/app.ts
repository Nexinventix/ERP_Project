// console.log('DEBUG: Top of app.ts, before any imports');

// console.log('DEBUG: Importing express');
import express, { Application } from 'express'
// console.log('DEBUG: Importing cookieParser');
import cookieParser from 'cookie-parser'
// console.log('DEBUG: Importing config');
import { PORT, NODE_ENV } from './config'
// console.log('DEBUG: Importing morgan');
import morgan from 'morgan'
// console.log('DEBUG: Importing cors');
import cors from 'cors'
// console.log('DEBUG: Importing logger and stream');
import { logger, stream } from './utils/logger'
// console.log('DEBUG: Importing dbConnect');
import { dbConnect } from './database'
// console.log('DEBUG: Importing helmet');
import helmet from 'helmet'
// console.log('DEBUG: Importing mongoose');
import { set, connect, disconnect } from 'mongoose'
// console.log('DEBUG: Importing apiKeyMiddleware');
import { apiKeyMiddleware } from './middlewares/apiKey';
// console.log('DEBUG: Importing scheduleMaintenanceAlerts');
import { scheduleMaintenanceAlerts } from './cron/maintenanceJob';
// console.log('DEBUG: Importing routers');
// console.log('DEBUG: Importing userRouter');
import userRouter from './routes/user'
// console.log('DEBUG: Importing fleetRouter');
import fleetRouter from './routes/fleet'
// console.log('DEBUG: Importing maintenanceRouter');
import maintenanceRouter from './routes/maintenance'
// console.log('DEBUG: Importing driverRouter');
import driverRouter from './routes/driver'
// console.log('DEBUG: Importing tripRouter');
import tripRouter from './routes/trip'
// console.log('DEBUG: Importing fuelLogRouter');
import fuelLogRouter from './routes/fuelLog'
// import certificationRouter from './routes/certification'

const App = {
   app: express() as Application, 
   port: PORT || 5000,
   env: NODE_ENV || 'development',

   initialize() {
   //  console.log('DEBUG: App.initialize() called');
      //this function automatic run
      this.initializeMiddlewares()
   //  console.log('DEBUG: After initializeMiddlewares');
      this.connectToDatabase()
   //  console.log('DEBUG: After connectToDatabase');
      this.initializeRoutes()
   //  console.log('DEBUG: After initializeRoutes');
      // this.initializeErrorHandling()
      
   },

   listen() {
   //  console.log('DEBUG: App.listen() called');
    try {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
            if (typeof logger !== 'undefined') {
                logger.info(`Server running on port ${this.port}`);
                logger.info(`=================================`);
                logger.info(`======= ENV: ${this.env} =======`);
                logger.info(`🚀 App listening on the port ${this.port}`);
                logger.info(`=================================`);
            }
        });
    } catch (err) {
        console.error('Error starting server:', err);
        throw err;
    }
   },

   async closeDatabaseConnection() {
      try {
         await disconnect()
         logger.info('database (mongoDB) has been disconnected successfully')
      } catch (error) {
         logger.info('something happen when closing database', error)
      }
   },

   async connectToDatabase() {
   //  console.log('App.connectToDatabase() called');
      if (this.env !== 'production') {
         set('debug', true)
      }
      try {
         const conn = await connect(dbConnect.url)
         logger.info('Database connected successfully!')
         logger.info(`MongoDB connected: ${conn.connection.host}`)
      } catch (error) {
         logger.info('Error connecting to the database:op', error)
      }
   },

   initializeMiddlewares() {
      // Logging
      this.app.use(morgan('combined', { stream }))

      // Security headers
      this.app.use(helmet({
         contentSecurityPolicy: true,
         crossOriginEmbedderPolicy: true,
         crossOriginOpenerPolicy: true,
         crossOriginResourcePolicy: true,
         dnsPrefetchControl: true,
         frameguard: { action: 'deny' },
         hidePoweredBy: true,
         hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
         ieNoOpen: true,
         noSniff: true,
         originAgentCluster: true,
         permittedCrossDomainPolicies: true,
         referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
         xssFilter: true
      }))

      // CORS configuration
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://dreamwork-test.vercel.app')
      .split(',')
      .map(origin => origin.trim().replace(/\/$/, '')); // remove trailing slash

      this.app.use(cors({
      origin: (origin, callback) => {
         if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
         }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      credentials: true,
      maxAge: 600
      }));

      // this.app.use(cors({
      //    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000','https://dreamwork-test.vercel.app/'],
      //    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      //    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      //    credentials: true,
      //    maxAge: 600 // 10 minutes
      // }))

      // Body parsing
      this.app.use(express.json({ limit: '10kb' })) // Limit body size
      this.app.use(express.urlencoded({ extended: true, limit: '10kb' }))
      this.app.use(cookieParser())

      // API security
      this.app.use(apiKeyMiddleware)

      // Import security middlewares
      const { rateLimiter, sanitizeInput, errorHandler } = require('./middlewares/securityMiddleware')

      // Rate limiting
      this.app.use(rateLimiter)

      // Input sanitization
      this.app.use(sanitizeInput)

      // Global error handling
      this.app.use(errorHandler)
   },

   initializeRoutes() {
      this.app.get('/api/test', (req, res) => {
         res.status(200).json({ message: 'GET request successful!' })
      })
      
      // User routes
      this.app.use('/api', userRouter);
      
      // Fleet management routes
      this.app.use('/api', fleetRouter);
      this.app.use('/api', maintenanceRouter);
      this.app.use('/api', driverRouter);
      this.app.use('/api', tripRouter);
      this.app.use('/api', fuelLogRouter);
   }
}

console.log('DEBUG: Before App.initialize()');
App.initialize()
console.log('DEBUG: After App.initialize()');
scheduleMaintenanceAlerts();
console.log('DEBUG: After scheduleMaintenanceAlerts');

export default App;
