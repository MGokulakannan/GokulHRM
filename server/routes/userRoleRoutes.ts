import express from "express";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

import {
  getUserRoles,
  getUserRoleById,
  createUserRole,
  updateUserRole,
  deleteUserRole,
} from "../controllers/userRoleController";


const router = express.Router();


/* =========================================
   USER ROLES
   (Admin only - this controls access levels)
========================================= */

router.get(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  getUserRoles
);


router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  getUserRoleById
);


router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createUserRole
);


router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateUserRole
);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteUserRole
);


export default router;