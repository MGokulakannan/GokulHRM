import express from "express";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

import {
  getJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle,
} from "../controllers/jobTitleController";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getJobTitles
);

router.get(
  "/:id",
  authMiddleware,
  getJobTitleById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createJobTitle
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateJobTitle
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteJobTitle
);

export default router;