import { Router } from "express";

import {
  getEmploymentStatuses,
  getEmploymentStatus,
  addEmploymentStatus,
  editEmploymentStatus,
  removeEmploymentStatus,
} from "../controllers/employmentStaturController"

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

const router = Router();

router.get("/", authMiddleware, getEmploymentStatuses);

router.get("/:id", authMiddleware, getEmploymentStatus);

router.post("/", authMiddleware, roleMiddleware("Admin"), addEmploymentStatus);

router.put("/:id", authMiddleware, roleMiddleware("Admin"), editEmploymentStatus);

router.delete("/:id", authMiddleware, roleMiddleware("Admin"), removeEmploymentStatus);

export default router;