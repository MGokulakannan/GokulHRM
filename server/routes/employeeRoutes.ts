import express from "express";
import { body } from "express-validator";

import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import validate from "../middleware/validate";

const router = express.Router();

const createEmployeeValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["Admin", "Employee"]).withMessage("Role must be Admin or Employee"),
  body("department").notEmpty().withMessage("Department is required"),
  body("designation").notEmpty().withMessage("Designation is required"),
];

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createEmployeeValidation,
  validate,
  createEmployee
);
// GET ALL EMPLOYEES
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  getAllEmployees
);

// GET EMPLOYEE BY ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  getEmployeeById
);

// UPDATE EMPLOYEE
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateEmployee
);

// DELETE EMPLOYEE
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteEmployee
);

export default router;