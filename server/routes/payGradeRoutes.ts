import express from "express";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

import {
  getPayGrades,
  getPayGradeById,
  createPayGrade,
  updatePayGrade,
  deletePayGrade,
} from "../controllers/payGradeController";


const router = express.Router();


router.get(
  "/",
  authMiddleware,
  getPayGrades
);


router.get(
  "/:id",
  authMiddleware,
  getPayGradeById
);


router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createPayGrade
);


router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updatePayGrade
);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deletePayGrade
);


export default router;