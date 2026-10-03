import { Request, Response } from "express";
import LeaveType from "../models/LeaveType";

export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: leaveTypes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch leave types",
    });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { name, daysPerYear, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const leaveType = await LeaveType.create({ name, daysPerYear, status });

    res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      data: leaveType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create leave type",
    });
  }
};

export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!leaveType) {
      return res.status(404).json({ success: false, message: "Leave type not found" });
    }

    res.status(200).json({
      success: true,
      message: "Leave type updated successfully",
      data: leaveType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update leave type",
    });
  }
};

export const deleteLeaveType = async (req: Request, res: Response) => {
  try {
    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);

    if (!leaveType) {
      return res.status(404).json({ success: false, message: "Leave type not found" });
    }

    res.status(200).json({ success: true, message: "Leave type deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete leave type",
    });
  }
};
