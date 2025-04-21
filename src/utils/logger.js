"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
const _config_1 = require("@config");
const path_1 = require("path");
const fs_1 = require("fs");
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
/* -------------------- code for setting up log directory ------------------- */
const logDir = (0, path_1.join)(__dirname, _config_1.LOG_DIR || 'logs ');
if (!(0, fs_1.existsSync)(logDir)) {
    (0, fs_1.mkdirSync)(logDir);
}
/* --------------------------- defining log format -------------------------- */
const logFormat = winston_1.default.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);
/* --------------------------- CREATING THE LOGGER -------------------------- */
const logger = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), logFormat),
    transports: [
        // debug log setting
        new winston_daily_rotate_file_1.default({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/debug',
            filename: `%DATE%.log`,
            maxFiles: 30,
            json: false,
            zippedArchive: true,
        }),
        // error log setting
        new winston_daily_rotate_file_1.default({
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
exports.logger = logger;
/* ------------------------ ADDING CONSOLE TRANSPORT ------------------------ */
logger.add(new winston_1.default.transports.Console({
    format: winston_1.default.format.combine(winston_1.default.format.splat(), winston_1.default.format.colorize()),
}));
const stream = {
    write: (message) => {
        logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
};
exports.stream = stream;
