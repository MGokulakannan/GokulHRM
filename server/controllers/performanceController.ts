import { Request, Response } from "express";
import PerformanceReview from "../models/PerformanceReview";
import Goal from "../models/Goal";

/* =========================================================
   PERFORMANCE REVIEWS
========================================================= */

export const getReviews = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const filter = currentUser.role === "Admin" ? {} : { employee: currentUser.id };

    const reviews = await PerformanceReview.find(filter)
      .populate("employee", "firstName lastName employeeId")
      .populate("reviewer", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch reviews",
    });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { employee, reviewPeriod, dueDate } = req.body;

    if (!employee || !reviewPeriod) {
      return res.status(400).json({
        success: false,
        message: "Employee and review period are required",
      });
    }

    const review = await PerformanceReview.create({
      employee,
      reviewer: currentUser.id,
      reviewPeriod,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Performance review created successfully",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create review",
    });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await PerformanceReview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update review",
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await PerformanceReview.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete review",
    });
  }
};

/* =========================================================
   GOALS
========================================================= */

export const getGoals = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const filter = currentUser.role === "Admin" ? {} : { employee: currentUser.id };

    const goals = await Goal.find(filter)
      .populate("employee", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch goals",
    });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const { employee, title, description, dueDate } = req.body;

    if (!employee || !title) {
      return res.status(400).json({
        success: false,
        message: "Employee and title are required",
      });
    }

    const goal = await Goal.create({ employee, title, description, dueDate });

    res.status(201).json({
      success: true,
      message: "Goal assigned successfully",
      data: goal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create goal",
    });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    const updateData = { ...req.body };

    // Employees may only update progress/status on their own goals.
    if (currentUser.role !== "Admin") {
      if (goal.employee.toString() !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own goals",
        });
      }

      const allowed: Record<string, any> = {};
      if (updateData.status !== undefined) allowed.status = updateData.status;
      if (updateData.progress !== undefined) allowed.progress = updateData.progress;
      Object.assign(goal, allowed);
    } else {
      Object.assign(goal, updateData);
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update goal",
    });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    res.status(200).json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete goal",
    });
  }
};
