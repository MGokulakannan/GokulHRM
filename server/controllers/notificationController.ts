import { Request, Response } from "express";
import Notification from "../models/Notification";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const notifications = await Notification.find({ user: currentUser.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      user: currentUser.id,
      read: false,
    });

    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch notifications",
    });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: currentUser.id },
      { read: true },
      { returnDocument: "after" }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update notification",
    });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    await Notification.updateMany({ user: currentUser.id, read: false }, { read: true });

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update notifications",
    });
  }
};
