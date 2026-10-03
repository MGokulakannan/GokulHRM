import { Request, Response } from "express";

import {
  getAllLeavesService,
  getLeavesByEmployeeService,
  getTodayLeavesService,
  getLeaveByIdService,
  createLeaveService,
  updateLeaveService,
  deleteLeaveService,
} from "../services/leaveService";
import Notification from "../models/Notification";
import Leave from "../models/Leave";
import LeaveType from "../models/LeaveType";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getLeaveDays = (startDate: Date, endDate: Date) =>
  Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

// Checks the employee's remaining balance for this leave type before an
// approval goes through. Only enforced when the leave type has a
// configured yearly allocation (admins who haven't set one up yet keep
// the previous unlimited behavior rather than being blocked).
const assertWithinLeaveBalance = async (leave: {
  _id: any;
  employee: any;
  leaveType: string;
  startDate: Date;
  endDate: Date;
}) => {
  const leaveType = await LeaveType.findOne({ name: leave.leaveType });

  if (!leaveType) {
    return;
  }

  const employeeId =
    (leave.employee as any)?._id?.toString() || (leave.employee as any)?.toString();

  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const approvedLeaves = await Leave.find({
    employee: employeeId,
    leaveType: leave.leaveType,
    status: "Approved",
    startDate: { $gte: yearStart },
    _id: { $ne: leave._id },
  });

  const alreadyUsed = approvedLeaves.reduce(
    (total, record) => total + getLeaveDays(record.startDate, record.endDate),
    0
  );

  const thisRequest = getLeaveDays(leave.startDate, leave.endDate);
  const totalAfterApproval = alreadyUsed + thisRequest;

  if (totalAfterApproval > leaveType.daysPerYear) {
    const error: any = new Error(
      `Approving this would use ${totalAfterApproval} of ${leaveType.daysPerYear} allotted ${leave.leaveType} days this year (${alreadyUsed} already taken).`
    );
    error.statusCode = 400;
    throw error;
  }
};


// =====================================================
// GET LEAVES
// Admin sees everyone's leave. Employees only see
// their own leave requests/history.
// =====================================================

export const getLeaves = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const leaves =
      currentUser.role === "Admin"
        ? await getAllLeavesService()
        : await getLeavesByEmployeeService(currentUser.id);

    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("Error fetching leaves:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch leaves",
    });
  }
};


// =====================================================
// GET TODAY'S LEAVES
// =====================================================

export const getTodayLeaves = async (req: Request, res: Response) => {
  try {
    const leaves = await getTodayLeavesService();

    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("Error fetching today's leaves:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch today's leaves",
    });
  }
};


// =====================================================
// GET LEAVE BY ID
// =====================================================

export const getLeaveById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const leave = await getLeaveByIdService(req.params.id);

    const ownerId = (leave.employee as any)?._id?.toString() || (leave.employee as any)?.toString();

    if (currentUser.role !== "Admin" && ownerId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own leave requests",
      });
    }

    return res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Error fetching leave:", error);

    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Leave not found",
    });
  }
};


// =====================================================
// CREATE LEAVE
// Employees can only create leave for themselves and
// it always starts out Pending, regardless of what the
// client sends. Admins may assign leave to anyone with
// any starting status.
// =====================================================

export const createLeave = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const { leaveType, startDate, endDate, reason } = req.body;

    const employee =
      currentUser.role === "Admin" ? req.body.employee || currentUser.id : currentUser.id;

    const status =
      currentUser.role === "Admin" ? req.body.status || "Pending" : "Pending";

    if (!employee || !leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Employee, leave type, start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave dates",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    const leave = await createLeaveService({
      employee,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Leave created successfully",
      data: leave,
    });
  } catch (error) {
    console.error("CREATE LEAVE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create leave",
    });
  }
};


// =====================================================
// UPDATE LEAVE
// Employees may only edit their own leave while it is
// still Pending, and may never change its status
// themselves (that would be self-approval). Admins may
// update anything, including approving/rejecting.
// =====================================================

export const updateLeave = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const existingLeave = await getLeaveByIdService(req.params.id);

    const ownerId =
      (existingLeave.employee as any)?._id?.toString() ||
      (existingLeave.employee as any)?.toString();

    const updateData = { ...req.body };

    if (currentUser.role !== "Admin") {
      if (ownerId !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: "You can only edit your own leave requests",
        });
      }

      if (existingLeave.status !== "Pending") {
        return res.status(403).json({
          success: false,
          message: "This leave request has already been reviewed and can no longer be edited",
        });
      }

      delete updateData.status;
      delete updateData.employee;
    }

    if (
      currentUser.role === "Admin" &&
      updateData.status === "Approved" &&
      existingLeave.status !== "Approved"
    ) {
      await assertWithinLeaveBalance({
        _id: existingLeave._id,
        employee: existingLeave.employee,
        leaveType: existingLeave.leaveType,
        startDate: existingLeave.startDate,
        endDate: existingLeave.endDate,
      });
    }

    const leave = await updateLeaveService(req.params.id, updateData);

    if (
      currentUser.role === "Admin" &&
      updateData.status &&
      updateData.status !== existingLeave.status &&
      (updateData.status === "Approved" || updateData.status === "Rejected")
    ) {
      await Notification.create({
        user: ownerId,
        title: `Leave ${updateData.status}`,
        message: `Your ${leave.leaveType} request (${leave.startDate.toDateString()} - ${leave.endDate.toDateString()}) was ${updateData.status.toLowerCase()}.`,
        type: updateData.status === "Approved" ? "success" : "danger",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      data: leave,
    });
  } catch (error) {
    console.error("UPDATE LEAVE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update leave",
    });
  }
};


// =====================================================
// DELETE LEAVE
// Employees may only cancel their own Pending requests.
// Admins may delete any leave record.
// =====================================================

export const deleteLeave = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const existingLeave = await getLeaveByIdService(req.params.id);

    const ownerId =
      (existingLeave.employee as any)?._id?.toString() ||
      (existingLeave.employee as any)?.toString();

    if (currentUser.role !== "Admin") {
      if (ownerId !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: "You can only cancel your own leave requests",
        });
      }

      if (existingLeave.status !== "Pending") {
        return res.status(403).json({
          success: false,
          message: "This leave request has already been reviewed and can no longer be cancelled",
        });
      }
    }

    await deleteLeaveService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (error) {
    console.error("DELETE LEAVE ERROR:", error);

    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Leave not found",
    });
  }
};
