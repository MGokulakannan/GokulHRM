import express from "express";
import { body } from "express-validator";
import {
  login,
  createEmployee,
  getMe,
  updateMe,
  changePassword,
} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import validate from "../middleware/validate";

const router = express.Router();

router.post(
  "/login",
  [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// SECURITY: this duplicates POST /api/employees (which is the route the
// frontend actually uses). It was previously reachable with no auth at
// all, letting anyone mint an Admin account. Locked down to Admin-only
// here; consider removing this route entirely in favor of the
// employees one, since nothing in the app calls it.
router.post(
  "/create-employee",
  authMiddleware,
  roleMiddleware("Admin"),
  createEmployee
);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.put("/change-password", authMiddleware, changePassword);

router.get("/profile", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Protected Route Accessed Successfully",
    user: (req as any).user,
  });
});

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("Admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

export default router;