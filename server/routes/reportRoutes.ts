import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import {
  getOverviewReport,
  getLeaveReport,
  getAttendanceReport,
  getEmployeeReport,
} from "../controllers/reportController";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("Admin"));

router.get("/overview", getOverviewReport);
router.get("/leave", getLeaveReport);
router.get("/attendance", getAttendanceReport);
router.get("/employees", getEmployeeReport);

export default router;
