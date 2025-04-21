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
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const _config_1 = require("@config");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("@utils/logger");
const _databases_1 = require("@databases");
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = require("mongoose");
const apiKey_1 = require("@middlewares/apiKey");
const maintenanceJob_1 = require("./cron/maintenanceJob");
const user_1 = __importDefault(require("./routes/user"));
const fleet_1 = __importDefault(require("./routes/fleet"));
const maintenance_1 = __importDefault(require("./routes/maintenance"));
const driver_1 = __importDefault(require("./routes/driver"));
const trip_1 = __importDefault(require("./routes/trip"));
const fuelLog_1 = __importDefault(require("./routes/fuelLog"));
// import certificationRouter from './routes/certification'
const App = {
    app: (0, express_1.default)(),
    port: _config_1.PORT || 5000,
    env: _config_1.NODE_ENV || 'development',
    initialize() {
        //this function automatic run
        this.initializeMiddlewares();
        this.connectToDatabase();
        this.initializeRoutes();
        // this.initializeErrorHandling()
    },
    listen() {
        this.app.listen(this.port, () => {
            logger_1.logger.info(`=================================`);
            logger_1.logger.info(`======= ENV: ${this.env} =======`);
            logger_1.logger.info(`🚀 App listening on the port ${this.port}`);
            logger_1.logger.info(`=================================`);
        });
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
            if (this.env !== 'production') {
                (0, mongoose_1.set)('debug', true);
            }
            try {
                const conn = yield (0, mongoose_1.connect)(_databases_1.dbConnect.url);
                logger_1.logger.info('Database connected successfully!');
                logger_1.logger.info(`MongoDB connected: ${conn.connection.host}`);
            }
            catch (error) {
                logger_1.logger.info('Error connecting to the database:op', error);
            }
        });
    },
    initializeMiddlewares() {
        var _a;
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
        this.app.use((0, cors_1.default)({
            origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
            credentials: true,
            maxAge: 600 // 10 minutes
        }));
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
    }
};
App.initialize();
(0, maintenanceJob_1.scheduleMaintenanceAlerts)();
exports.default = App;
