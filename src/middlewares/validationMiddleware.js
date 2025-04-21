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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield Promise.all(validations.map(validation => validation.run(req)));
            const result = (0, express_validator_1.validationResult)(req);
            if (result.isEmpty()) {
                next();
                return;
            }
            res.status(400).json({ errors: result.array() });
            return;
        }
        catch (error) {
            next(error);
            return;
        }
    });
};
exports.validate = validate;
