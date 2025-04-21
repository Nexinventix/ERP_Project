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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../models/users"));
const _config_1 = require("@config");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error('Authentication required');
        }
        const decoded = jsonwebtoken_1.default.verify(token, _config_1.SECRET_KEY);
        const user = yield users_1.default.findOne({ _id: decoded.id });
        if (!user) {
            throw new Error('User not found');
        }
        // Set the user on the request object
        req.user = user;
        next();
    }
    catch (error) {
        // res.status(401).json({ message: error.message });
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.authMiddleware = authMiddleware;
