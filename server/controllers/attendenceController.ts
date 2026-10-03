import { Request, Response } from "express";
import Attendance from "../models/Attendance";

const getStartOfDay = (date: Date = new Date()) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getEndOfDay = (date: Date = new Date()) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

// =====================================================
// TODAY'S ATTENDANCE (all present employees)
// =====================================================

export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await Attendance.find({
      date: { $gte: getStartOfDay(), $lte: getEndOfDay() },
      status: "Present",
    }).populate("employee", "firstName lastName employeeId");

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch today's attendance",
    });
  }
};

// =====================================================
// CHECK IN (self-service)
// =====================================================

export const checkIn = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: getStartOfDay(), $lte: getEndOfDay() },
    });

    if (existing && existing.checkIn) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in today",
      });
    }

    const attendance = existing
      ? await Attendance.findByIdAndUpdate(
          existing._id,
          { checkIn: new Date(), status: "Present" },
          { returnDocument: "after" }
        )
      : await Attendance.create({
          employee: employeeId,
          date: new Date(),
          checkIn: new Date(),
          status: "Present",
        });

    res.status(200).json({
      success: true,
      message: "Checked in successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to check in",
    });
  }
};

// =====================================================
// CHECK OUT (self-service)
// =====================================================

export const checkOut = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: getStartOfDay(), $lte: getEndOfDay() },
    });

    if (!existing || !existing.checkIn) {
      return res.status(400).json({
        success: false,
        message: "You must check in before checking out",
      });
    }

    if (existing.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today",
      });
    }

    existing.checkOut = new Date();
    await existing.save();

    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: existing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to check out",
    });
  }
};

// =====================================================
// MY ATTENDANCE HISTORY (self-service, date filterable)
// =====================================================

export const getMyAttendance = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const { from, to } = req.query;

    const filter: Record<string, any> = { employee: employeeId };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = getStartOfDay(new Date(from as string));
      if (to) filter.date.$lte = getEndOfDay(new Date(to as string));
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch attendance history",
    });
  }
};

// =====================================================
// ALL ATTENDANCE (Admin, date + employee filterable)
// =====================================================

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const { from, to, employee } = req.query;

    const filter: Record<string, any> = {};

    if (employee) filter.employee = employee;

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = getStartOfDay(new Date(from as string));
      if (to) filter.date.$lte = getEndOfDay(new Date(to as string));
    }

    const attendance = await Attendance.find(filter)
      .populate("employee", "firstName lastName employeeId")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch attendance",
    });
  }
};

// =====================================================
// CREATE ATTENDANCE (Admin override / manual entry)
// =====================================================

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { employee, status, checkIn: checkInTime, checkOut: checkOutTime, date } =
      req.body;

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const attendance = await Attendance.create({
      employee,
      date: date ? new Date(date) : new Date(),
      status: status || "Present",
      checkIn: checkInTime || new Date(),
      checkOut: checkOutTime,
    });

    res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create attendance",
    });
  }
};
