import express from "express";

import authMiddleware from "../middleware/authMiddleware";

import {
  getLeaves,
  getTodayLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave,
} from "../controllers/leaveController";


const router =
  express.Router();


// =====================================================
// GET ALL LEAVES
// =====================================================

router.get(
  "/",
  authMiddleware,
  getLeaves
);


// =====================================================
// GET TODAY'S LEAVES
// =====================================================

router.get(
  "/today",
  authMiddleware,
  getTodayLeaves
);


// =====================================================
// GET LEAVE BY ID
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  getLeaveById
);


// =====================================================
// CREATE LEAVE
// =====================================================

router.post(
  "/",
  authMiddleware,
  createLeave
);


// =====================================================
// UPDATE LEAVE
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  updateLeave
);


// =====================================================
// DELETE LEAVE
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteLeave
);


export default router;