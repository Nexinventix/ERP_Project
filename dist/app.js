"use strict";
// console.log('DEBUG: Top of app.ts, before any imports');
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
// console.log('DEBUG: Importing express');
const express_1 = __importDefault(require("express"));
// console.log('DEBUG: Importing cookieParser');
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// console.log('DEBUG: Importing config');
const config_1 = require("./config");
// console.log('DEBUG: Importing morgan');
const morgan_1 = __importDefault(require("morgan"));
// console.log('DEBUG: Importing cors');
const cors_1 = __importDefault(require("cors"));
// console.log('DEBUG: Importing logger and stream');
const logger_1 = require("./utils/logger");
// console.log('DEBUG: Importing dbConnect');
const database_1 = require("./database");
// console.log('DEBUG: Importing helmet');
const helmet_1 = __importDefault(require("helmet"));
// console.log('DEBUG: Importing mongoose');
const mongoose_1 = require("mongoose");
// console.log('DEBUG: Importing apiKeyMiddleware');
const apiKey_1 = require("./middlewares/apiKey");
// console.log('DEBUG: Importing scheduleMaintenanceAlerts');
const maintenanceJob_1 = require("./cron/maintenanceJob");
// console.log('DEBUG: Importing routers');
// console.log('DEBUG: Importing userRouter');
const user_1 = __importDefault(require("./routes/user"));
// console.log('DEBUG: Importing fleetRouter');
const fleet_1 = __importDefault(require("./routes/fleet"));
// console.log('DEBUG: Importing maintenanceRouter');
const maintenance_1 = __importDefault(require("./routes/maintenance"));
// console.log('DEBUG: Importing driverRouter');
const driver_1 = __importDefault(require("./routes/driver"));
// console.log('DEBUG: Importing tripRouter');
const trip_1 = __importDefault(require("./routes/trip"));
// console.log('DEBUG: Importing fuelLogRouter');
const fuelLog_1 = __importDefault(require("./routes/fuelLog"));
const infographics_1 = __importDefault(require("./routes/infographics"));
const client_1 = __importDefault(require("./routes/client"));
// import certificationRouter from './routes/certification'
const App = {
    app: (0, express_1.default)(),
    port: config_1.PORT || 5000,
    env: config_1.NODE_ENV || 'development',
    initialize() {
        //  console.log('DEBUG: App.initialize() called');
        //this function automatic run
        this.initializeMiddlewares();
        //  console.log('DEBUG: After initializeMiddlewares');
        this.connectToDatabase();
        //  console.log('DEBUG: After connectToDatabase');
        this.initializeRoutes();
        //  console.log('DEBUG: After initializeRoutes');
        // this.initializeErrorHandling()
    },
    listen() {
        //  console.log('DEBUG: App.listen() called');
        try {
            this.app.listen(this.port, () => {
                console.log(`Server running on port ${this.port}`);
                if (typeof logger_1.logger !== 'undefined') {
                    logger_1.logger.info(`Server running on port ${this.port}`);
                    logger_1.logger.info(`=================================`);
                    logger_1.logger.info(`======= ENV: ${this.env} =======`);
                    logger_1.logger.info(`🚀 App listening on the port ${this.port}`);
                    logger_1.logger.info(`=================================`);
                }
            });
        }
        catch (err) {
            console.error('Error starting server:', err);
            throw err;
        }
    },
    closeDatabaseConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, mongoose_1.disconnect)();
                logger_1.logger.info('database (mongoDB) has been disconnected successfully');
            }
            catch (error) {
                logger_1.logger.info('something happen when closing database', error);
            }
        });
    },
    connectToDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            //  console.log('App.connectToDatabase() called');
            if (this.env !== 'production') {
                (0, mongoose_1.set)('debug', true);
            }
            try {
                const conn = yield (0, mongoose_1.connect)(database_1.dbConnect.url);
                logger_1.logger.info('Database connected successfully!');
                logger_1.logger.info(`MongoDB connected: ${conn.connection.host}`);
            }
            catch (error) {
                logger_1.logger.info('Error connecting to the database:op', error);
            }
        });
    },
    initializeMiddlewares() {
        // Logging
        this.app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
        // Security headers
        this.app.use((0, helmet_1.default)({
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
        }));
        // CORS configuration
        // Define allowed origins with and without www
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://dreamwork-test.vercel.app,https://www.dreamworkslogisticserp.com,https://dreamworkslogisticserp.com')
            .split(',')
            .map(origin => origin.trim().replace(/\/$/, '')); // remove trailing slash
        console.log('Allowed Origins:', allowedOrigins);
        const corsOptions = {
            origin: (origin, callback) => {
                console.log('Incoming origin:', origin);
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin)
                    return callback(null, true);
                // Check if the origin is in the allowed list or is a subdomain of an allowed origin
                const isAllowed = allowedOrigins.some(allowedOrigin => origin === allowedOrigin ||
                    origin === allowedOrigin.replace('www.', '') ||
                    origin === allowedOrigin.replace('https://', 'https://www.'));
                if (isAllowed) {
                    console.log('Origin allowed:', origin);
                    callback(null, true);
                }
                else {
                    console.log('Origin not allowed:', origin);
                    callback(new Error(`CORS policy does not allow access from origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
            credentials: true,
            maxAge: 600
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.options('*', (0, cors_1.default)(corsOptions));
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10kb' })); // Limit body size
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
        this.app.use((0, cookie_parser_1.default)());
        // API security
        this.app.use(apiKey_1.apiKeyMiddleware);
        // Import security middlewares
        const { rateLimiter, sanitizeInput, errorHandler } = require('./middlewares/securityMiddleware');
        // Rate limiting
        this.app.use(rateLimiter);
        // Input sanitization
        this.app.use(sanitizeInput);
        // Global error handling
        this.app.use(errorHandler);
    },
    initializeRoutes() {
        this.app.get('/api/test', (req, res) => {
            res.status(200).json({ message: 'GET request successful!' });
        });
        // User routes
        this.app.use('/api', user_1.default);
        // Fleet management routes
        this.app.use('/api', fleet_1.default);
        this.app.use('/api', maintenance_1.default);
        this.app.use('/api', driver_1.default);
        this.app.use('/api', trip_1.default);
        this.app.use('/api', fuelLog_1.default);
        this.app.use('/api', infographics_1.default);
        this.app.use('/api/clients', client_1.default);
    }
};
console.log('DEBUG: Before App.initialize()');
App.initialize();
console.log('DEBUG: After App.initialize()');
(0, maintenanceJob_1.scheduleMaintenanceAlerts)();
console.log('DEBUG: After scheduleMaintenanceAlerts');
exports.default = App;
