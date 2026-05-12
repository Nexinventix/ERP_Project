"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('DEBUG: Top of server.ts, before imports');
console.log('DEBUG: Server starting...');
// console.log('Starting ERP_Project server...');
// console.log('ENV:', process.env);
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger");
try {
    // Ensure the app listens on the correct port
    const port = process.env.PORT || 5000;
    console.log('DEBUG: Before setting App.port');
    app_1.default.port = port;
    console.log('DEBUG: After setting App.port, before App.listen()');
    app_1.default.listen();
    console.log('DEBUG: After App.listen()');
}
catch (err) {
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
function shutdownServer(signal) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info(`Received ${signal}. Shutting down server...`);
            yield app_1.default.closeDatabaseConnection();
            logger_1.logger.info('Server stopped gracefully.');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error('Error during server shutdown:', error);
            process.exit(1);
        }
    });
}
function handleUncaughtError(error) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.error('Server shutting down due to uncaught exception:', error);
        yield app_1.default.closeDatabaseConnection();
        process.exit(1);
    });
}
// console.log('sdf')
function handleUnhandledRejection(reason, promise) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.error('Unhandled promise rejection:', reason);
        logger_1.logger.info('Promise:', promise);
        yield app_1.default.closeDatabaseConnection();
        process.exit(1);
    });
}
/* ------------------------ Handle uncaught rejection ----------------------- */
process.on('uncaughtException', handleUncaughtError);
/* ------------------- Handle unhandled promise rejections ------------------- */
process.on('unhandledRejection', handleUnhandledRejection);
/* ----------------------------- Handle SIGINT ----------------------------- */
process.on('SIGINT', () => shutdownServer('SIGINT'));
/* ------------------- Handle SIGTERM (termination signal) ------------------ */
process.on('SIGTERM', () => shutdownServer('SIGTERM'));
