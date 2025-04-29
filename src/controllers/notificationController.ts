import Notification from '../models/notification';
import { Request, Response } from 'express';

// Mark a notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read (optionally filter by vehicle)
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.body;
    const filter: any = {};
    if (vehicleId) filter.vehicle = vehicleId;
    await Notification.updateMany(filter, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread notifications (optionally filter by vehicle)
export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.query;
    const query: any = { read: false };
    if (vehicleId) query.vehicle = vehicleId;
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a notification by ID
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// (Optional) Get all notifications for a vehicle or user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.query;
    const query: any = {};
    if (vehicleId) query.vehicle = vehicleId;
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
