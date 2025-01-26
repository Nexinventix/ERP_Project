import express, { Application } from 'express'
import cookieParser from 'cookie-parser'
import { PORT, NODE_ENV } from '@config'
import morgan from 'morgan'
import cors from 'cors'
import { logger, stream } from '@utils/logger'
import { dbConnect } from '@databases'
import helmet from 'helmet'
import { set, connect, disconnect } from 'mongoose'

class App {
   public app: Application
   public port: number | string
   public env: string

   constructor() {
      this.app = express()
      this.env = NODE_ENV || 'development'
      this.port = PORT || 5000

      //this function automatic run
      this.initializeMiddlewares()
      this.connectToDatabase()
      this.initializeRoutes();
      // this.initializeErrorHandling();
   }
   public listen() {
      this.app.listen(this.port, () => {
         logger.info(`=================================`)
         logger.info(`======= ENV: ${this.env} =======`)
         logger.info(`🚀 App listening onn the port ${this.port}`)
         logger.info(`=================================`)
      })
   }

   public async closeDatabaseConnection(): Promise<void> {
      try {
         await disconnect()
         logger.info('database (mongoDbB) has been disconnect successfully')
      } catch (error) {
         logger.info('something happen when closing database', error)
      }
   }

   private async connectToDatabase() {
      if (this.env !== 'production') {
         set('debug', true)
      }
      try {
         const conn = await connect(dbConnect.url)
         logger.info('Database connecteD successfully!')
         logger.info(`MongoDBcf connected: ${conn.connection.host}`)
      } catch (error) {
         logger.info('Error connecting to the database:op', error)
      }
   }

   private initializeMiddlewares() {
      this.app.use(morgan('combined', { stream }))
      this.app.use(cors())
      this.app.use(express.json())
      this.app.use(helmet())
      this.app.use(cookieParser())


   }

   private initializeRoutes() {
    this.app.get('/api/test', (req, res) => {
      res.status(200).json({ message: 'GET request successful!' });
  });
  }
}

export default App
