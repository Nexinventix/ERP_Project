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
exports.getNotifications = exports.deleteNotification = exports.getUnreadNotifications = exports.markAllAsRead = exports.markAsRead = void 0;
const notification_1 = __importDefault(require("@models/notification"));
// Mark a notification as read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = req.params;
        const notification = yield notification_1.default.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification marked as read', notification });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.markAsRead = markAsRead;
// Mark all notifications as read (optionally filter by vehicle)
const markAllAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vehicleId } = req.body;
        const filter = {};
        if (vehicleId)
            filter.vehicle = vehicleId;
        yield notification_1.default.updateMany(filter, { read: true });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.markAllAsRead = markAllAsRead;
// Get unread notifications (optionally filter by vehicle)
const getUnreadNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vehicleId } = req.query;
        const query = { read: false };
        if (vehicleId)
            query.vehicle = vehicleId;
        const notifications = yield notification_1.default.find(query).sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUnreadNotifications = getUnreadNotifications;
// Delete a notification by ID
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = req.params;
        const deleted = yield notification_1.default.findByIdAndDelete(notificationId);
        if (!deleted) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteNotification = deleteNotification;
// (Optional) Get all notifications for a vehicle or user
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vehicleId } = req.query;
        const query = {};
        if (vehicleId)
            query.vehicle = vehicleId;
        const notifications = yield notification_1.default.find(query).sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getNotifications = getNotifications;
