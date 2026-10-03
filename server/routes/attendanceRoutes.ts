import express from "express";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import {
  getTodayAttendance,
  createAttendance,
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
} from "../controllers/attendenceController";

const router = express.Router();

// Self-service check in / check out
router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);

// My own attendance history
router.get("/me", authMiddleware, getMyAttendance);

// Today's present employees
router.get("/today", authMiddleware, getTodayAttendance);

// Admin: all employees' attendance (filterable)
router.get("/", authMiddleware, roleMiddleware("Admin"), getAllAttendance);

// Admin: manual attendance entry
router.post("/", authMiddleware, roleMiddleware("Admin"), createAttendance);

export default router;
