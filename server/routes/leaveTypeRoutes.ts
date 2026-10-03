import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "../controllers/leaveTypeController";

const router = express.Router();

router.get("/", authMiddleware, getLeaveTypes);
router.post("/", authMiddleware, roleMiddleware("Admin"), createLeaveType);
router.put("/:id", authMiddleware, roleMiddleware("Admin"), updateLeaveType);
router.delete("/:id", authMiddleware, roleMiddleware("Admin"), deleteLeaveType);

export default router;
