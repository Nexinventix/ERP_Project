"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    vehicle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
exports.default = (0, mongoose_1.model)('Notification', NotificationSchema);
