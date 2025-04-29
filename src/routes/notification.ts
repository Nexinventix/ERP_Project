import { Router } from 'express';
import { deleteNotification, getNotifications, markAsRead, markAllAsRead, getUnreadNotifications } from '../controllers/notificationController';

const router = Router();

// Get all notifications (optionally filter by vehicle)
router.get('/', getNotifications);

// Get unread notifications
router.get('/unread', getUnreadNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete a notification by ID
router.delete('/:notificationId', deleteNotification);

export default router;
