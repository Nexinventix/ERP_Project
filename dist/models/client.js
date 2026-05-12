"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const mongoose_1 = require("mongoose");
const ClientSchema = new mongoose_1.Schema({
    contactPerson: { type: String, trim: true },
    contactPersonEmail: { type: String, trim: true },
    contactPersonPhone: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    companyName: { type: String, trim: true },
    industry: { type: String, trim: true },
    notes: { type: String, trim: true },
}, {
    timestamps: true
});
exports.Client = (0, mongoose_1.model)('Client', ClientSchema);
