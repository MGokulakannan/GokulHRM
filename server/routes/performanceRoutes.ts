import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/performanceController";

const router = express.Router();

// Reviews - everyone sees their own, Admin sees/manages all
router.get("/reviews", authMiddleware, getReviews);
router.post("/reviews", authMiddleware, roleMiddleware("Admin"), createReview);
router.put("/reviews/:id", authMiddleware, roleMiddleware("Admin"), updateReview);
router.delete("/reviews/:id", authMiddleware, roleMiddleware("Admin"), deleteReview);

// Goals - everyone sees their own, Admin assigns, both can update progress
router.get("/goals", authMiddleware, getGoals);
router.post("/goals", authMiddleware, roleMiddleware("Admin"), createGoal);
router.put("/goals/:id", authMiddleware, updateGoal);
router.delete("/goals/:id", authMiddleware, roleMiddleware("Admin"), deleteGoal);

export default router;
