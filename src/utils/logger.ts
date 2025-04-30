import { LOG_DIR } from '../config'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import winston from 'winston'
import winstonDaily from 'winston-daily-rotate-file'

/* -------------------- code for setting up log directory ------------------- */
let logDir: string;
try {
   logDir = join(__dirname, LOG_DIR || 'logs');
   console.log('DEBUG: logger logDir resolved to', logDir);
   if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
      console.log('DEBUG: logger logDir created:', logDir);
   } else {
      console.log('DEBUG: logger logDir already exists:', logDir);
   }
} catch (e) {
   console.error('LOGGER INIT ERROR:', e);
   logDir = join(__dirname, 'logs');
}

/* --------------------------- defining log format -------------------------- */

const logFormat = winston.format.printf(
   ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
)

/* --------------------------- CREATING THE LOGGER -------------------------- */

let logger: any;
try {
   logger = winston.createLogger({
      format: winston.format.combine(
         winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
         }),
         logFormat
      ),
      transports: [
         // debug log setting
         new winstonDaily({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/debug',
            filename: `%DATE%.log`,
            maxFiles: 30,
            json: false,
            zippedArchive: true,
         }),
         // error log setting
         new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',
            filename: `%DATE%.log`,
            maxFiles: 30,
            handleExceptions: true,
            json: false,
            zippedArchive: true,
         }),
      ],
   });
   console.log('DEBUG: Winston logger created successfully');
} catch (e) {
   console.error('LOGGER CREATION ERROR:', e);
}

/* ------------------------ ADDING CONSOLE TRANSPORT ------------------------ */
logger.add(
   new winston.transports.Console({
      format: winston.format.combine(
         winston.format.splat(),
         winston.format.colorize()
      ),
   })
)

const stream: any = {
   write: (message: string) => {
      logger.info(message.substring(0, message.lastIndexOf('\n')))
   },
}

export { logger, stream }
