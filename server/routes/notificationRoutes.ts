import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController";

const router = express.Router();

router.get("/me", authMiddleware, getMyNotifications);
router.put("/:id/read", authMiddleware, markNotificationRead);
router.put("/read-all", authMiddleware, markAllNotificationsRead);

export default router;
