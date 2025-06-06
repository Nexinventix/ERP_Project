console.log('DEBUG: Top of server.ts, before imports');
console.log('DEBUG: Server starting...');
// console.log('Starting ERP_Project server...');
// console.log('ENV:', process.env);

import App from './app'
import { logger } from './utils/logger'
import route from './routes/user';

try {
  // Ensure the app listens on the correct port
  const port = process.env.PORT || 5000;
  console.log('DEBUG: Before setting App.port');
  App.port = port;
  console.log('DEBUG: After setting App.port, before App.listen()');
  App.listen();
  console.log('DEBUG: After App.listen()');
} catch (err) {
  console.error('Startup error:', err);
  process.exit(1);
}

process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

async function shutdownServer(signal: string) {
   try {
      logger.info(`Received ${signal}. Shutting down server...`)
      await App.closeDatabaseConnection()
      logger.info('Server stopped gracefully.')
      process.exit(0)
   } catch (error) {
      logger.error('Error during server shutdown:', error)
      process.exit(1)
   }
}

async function handleUncaughtError(error: Error) {
   logger.error('Server shutting down due to uncaught exception:', error)
   await App.closeDatabaseConnection()
   process.exit(1)
}

// console.log('sdf')

async function handleUnhandledRejection(reason: string, promise: Promise<any>) {
   logger.error('Unhandled promise rejection:', reason)
   logger.info('Promise:', promise)
   await App.closeDatabaseConnection()
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
