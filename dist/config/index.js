"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_PASS = exports.EMAIL_USER = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.API_KEY_2 = exports.API_KEY_1 = exports.DB_PASSWORD = exports.DB_USER = exports.SECRET_KEY = exports.LOG_FORMAT = exports.LOG_DIR = exports.DB_NAME = exports.DB_PORT = exports.DB_HOST = exports.PORT = exports.NODE_ENV = exports.CREDENTIALS = void 0;
const dotenv_1 = require("dotenv");
//NODE_ENV is being pass on the dev and start script on the package.json file
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV}.local` });
exports.CREDENTIALS = process.env.CREDENTIALS === 'true';
_a = process.env, exports.NODE_ENV = _a.NODE_ENV, exports.PORT = _a.PORT, exports.DB_HOST = _a.DB_HOST, exports.DB_PORT = _a.DB_PORT, exports.DB_NAME = _a.DB_NAME, exports.LOG_DIR = _a.LOG_DIR, exports.LOG_FORMAT = _a.LOG_FORMAT, exports.SECRET_KEY = _a.SECRET_KEY, exports.DB_USER = _a.DB_USER, exports.DB_PASSWORD = _a.DB_PASSWORD, exports.API_KEY_1 = _a.API_KEY_1, exports.API_KEY_2 = _a.API_KEY_2, exports.CLOUDINARY_CLOUD_NAME = _a.CLOUDINARY_CLOUD_NAME, exports.CLOUDINARY_API_KEY = _a.CLOUDINARY_API_KEY, exports.CLOUDINARY_API_SECRET = _a.CLOUDINARY_API_SECRET, exports.EMAIL_USER = _a.EMAIL_USER, exports.EMAIL_PASS = _a.EMAIL_PASS;
