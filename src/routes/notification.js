"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("@controllers/notificationController");
const router = (0, express_1.Router)();
// Get all notifications (optionally filter by vehicle)
router.get('/', notificationController_1.getNotifications);
// Get unread notifications
router.get('/unread', notificationController_1.getUnreadNotifications);
// Mark a notification as read
router.patch('/:notificationId/read', notificationController_1.markAsRead);
// Mark all notifications as read
router.patch('/read-all', notificationController_1.markAllAsRead);
// Delete a notification by ID
router.delete('/:notificationId', notificationController_1.deleteNotification);
exports.default = router;
