import express, { Application } from 'express'
import cookieParser from 'cookie-parser'
import { PORT, NODE_ENV } from '@config'
import morgan from 'morgan'
import cors from 'cors'
import { logger, stream } from '@utils/logger'
import { dbConnect } from '@databases'
import helmet from 'helmet'
import { set, connect, disconnect } from 'mongoose'
import router from './routes/user'

const App = {
   app: express(),
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
      this.app.use(morgan('combined', { stream }))
      this.app.use(cors())
      this.app.use(express.json())
      this.app.use(helmet())
      this.app.use(cookieParser())
   },

   initializeRoutes() {
      this.app.get('/api/test', (req, res) => {
         res.status(200).json({ message: 'GET request successful!' })
      })
      
      this.app.use('/api', router);
   }
}

App.initialize()

export default App
