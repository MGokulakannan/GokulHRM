import express from "express";

import {
  createDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} from "../controllers/designationController";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

const router = express.Router();

// Create designation
router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createDesignation
);

// Get all designations (any authenticated user - needed to display
// designation names on employee-facing pages like My Profile)
router.get(
  "/",
  authMiddleware,
  getAllDesignations
);

// Get designation by ID
router.get(
  "/:id",
  authMiddleware,
  getDesignationById
);

// Update designation
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateDesignation
);

// Delete designation
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteDesignation
);

export default router;