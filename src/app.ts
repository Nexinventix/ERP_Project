import express, { Application } from 'express'
import cookieParser from 'cookie-parser'
import { PORT, NODE_ENV } from '@config'
import morgan from 'morgan'
import cors from 'cors'
import { logger, stream } from '@utils/logger'
import { dbConnect } from '@databases'
import helmet from 'helmet'
import { set, connect, disconnect } from 'mongoose'
import { apiKeyMiddleware } from '@middlewares/apiKey';
import { scheduleMaintenanceAlerts } from './cron/maintenanceJob';
import userRouter from './routes/user'
import fleetRouter from './routes/fleet'
import maintenanceRouter from './routes/maintenance'
import driverRouter from './routes/driver'
import tripRouter from './routes/trip'
import fuelLogRouter from './routes/fuelLog'
// import certificationRouter from './routes/certification'

const App = {
   app: express() as Application, 
   port: PORT || 5000,
   env: NODE_ENV || 'development',

   initialize() {
      //this function automatic run
      this.initializeMiddlewares()
      this.connectToDatabase()
      this.initializeRoutes()
      // this.initializeErrorHandling()
      
   },

   listen() {
      this.app.listen(this.port, () => {
         logger.info(`=================================`)
         logger.info(`======= ENV: ${this.env} =======`)
         logger.info(`🚀 App listening on the port ${this.port}`)
         logger.info(`=================================`)
      })
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
      this.app.use(cors({
         origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
         methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
         allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
         credentials: true,
         maxAge: 600 // 10 minutes
      }))

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

App.initialize()
scheduleMaintenanceAlerts();

export default App
