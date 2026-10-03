import express from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

const router = express.Router();

// Create Department
router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createDepartment
);

// Get All Departments (any authenticated user - needed to display
// department names on employee-facing pages like My Profile)
router.get(
  "/",
  authMiddleware,
  getAllDepartments
);

// Get Department By ID
router.get(
  "/:id",
  authMiddleware,
  getDepartmentById
);

// Update Department
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateDepartment
);

// Delete Department
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteDepartment
);

export default router;