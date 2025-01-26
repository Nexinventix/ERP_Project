import App from '@/app'
import { logger } from '@utils/logger'
// import AuthRoute from '@/routes/auth.route';

const app = new App()
app.listen()

async function shutdownServer(signal: string) {
   try {
      logger.info(`Received ${signal}. Shutting down server...`)
      await app.closeDatabaseConnection()
      logger.info('Server stopped gracefully.')
      process.exit(0)
   } catch (error) {
      logger.error('Error during server shutdown:', error)
      process.exit(1)
   }
}

async function handleUncaughtError(error: Error) {
   logger.error('Server shutting down due to uncaught exception:', error)
   await app.closeDatabaseConnection()
   process.exit(1)
}

console.log('sdf')

async function handleUnhandledRejection(reason: string, promise: Promise<any>) {
   logger.error('Unhandled promise rejection:', reason)
   logger.info('Promise:', promise)
   await app.closeDatabaseConnection()
   process.exit(1)
}

/* ------------------------ Handle uncaught rejection ----------------------- */
process.on('uncaughtException', handleUncaughtError)

/* ------------------- Handle unhandled promise rejections ------------------- */
process.on('unhandledRejection', handleUnhandledRejection)

/* ----------------------------- Handle SIGINT ----------------------------- */
process.on('SIGINT', () => shutdownServer('SIGINT'))

/* ------------------- Handle SIGTERM (termination signal) ------------------ */
process.on('SIGTERM', () => shutdownServer('SIGTERM'))
