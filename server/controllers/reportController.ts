import { Request, Response } from "express";
import User from "../models/Users";
import Leave from "../models/Leave";
import Attendance from "../models/Attendance";
import Department from "../models/Department";
import { getAdminDashboardData } from "../services/dashboardService";

export const getOverviewReport = async (req: Request, res: Response) => {
  try {
    const dashboard = await getAdminDashboardData();
    res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to build report",
    });
  }
};

export const getLeaveReport = async (req: Request, res: Response) => {
  try {
    const byType = await Leave.aggregate([
      { $match: { status: "Approved" } },
      {
        $group: {
          _id: "$leaveType",
          totalDays: {
            $sum: {
              $add: [
                {
                  $divide: [
                    { $subtract: ["$endDate", "$startDate"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
                1,
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalDays: -1 } },
    ]);

    const byStatus = await Leave.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: byType.map((item) => ({
          leaveType: item._id,
          totalDays: Math.round(item.totalDays),
          count: item.count,
        })),
        byStatus: byStatus.map((item) => ({ status: item._id, count: item.count })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to build leave report",
    });
  }
};

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    const filter: Record<string, any> = {};
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from as string);
      if (to) {
        const end = new Date(to as string);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const byStatus = await Attendance.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: byStatus.map((item) => ({ status: item._id, count: item.count })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to build attendance report",
    });
  }
};

export const getEmployeeReport = async (req: Request, res: Response) => {
  try {
    const [byDepartment, byStatus, byGender] = await Promise.all([
      User.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
      ]),
      User.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }]),
    ]);

    const departments = await Department.find().lean();
    const departmentMap = new Map<string, string>();
    departments.forEach((department: any) =>
      departmentMap.set(department._id.toString(), department.name)
    );

    res.status(200).json({
      success: true,
      data: {
        byDepartment: byDepartment.map((item) => ({
          department: departmentMap.get(item._id?.toString() || "") || "Unassigned",
          count: item.count,
        })),
        byStatus: byStatus.map((item) => ({ status: item._id, count: item.count })),
        byGender: byGender.map((item) => ({ gender: item._id, count: item.count })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to build employee report",
    });
  }
};
