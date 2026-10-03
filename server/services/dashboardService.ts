import mongoose from "mongoose";
import User from "../models/Users";
import Leave from "../models/Leave";
import Department from "../models/Department";
import Designation from "../models/Desiganation";
import Attendance from "../models/Attendance";

/* =========================================================
   DATE HELPERS
========================================================= */

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

const getStartOfYear = () => {
  const date = new Date();
  return new Date(date.getFullYear(), 0, 1);
};

/* =========================================================
   SHARED: DEPARTMENT NAME LOOKUP
========================================================= */

const buildDepartmentMap = async () => {
  const departments = await Department.find().lean();
  const map = new Map<string, string>();
  departments.forEach((department: any) => {
    map.set(department._id.toString(), department.name);
  });
  return map;
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export const getAdminDashboardData = async () => {
  const startOfDay = getStartOfDay();
  const endOfDay = getEndOfDay();

  const [
    totalEmployees,
    activeEmployees,
    departmentsCount,
    todaysAttendanceCount,
    employeesOnLeaveToday,
    leavePending,
    leaveApproved,
    leaveRejected,
    departmentGroups,
    departments,
    recentEmployees,
    recentLeaves,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "Active" }),
    Department.countDocuments({ status: "Active" }),
    Attendance.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: "Present",
    }),
    Leave.countDocuments({
      status: "Approved",
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    }),
    Leave.countDocuments({ status: "Pending" }),
    Leave.countDocuments({ status: "Approved" }),
    Leave.countDocuments({ status: "Rejected" }),
    User.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    buildDepartmentMap(),
    User.find().sort({ createdAt: -1 }).limit(5).select(
      "firstName lastName createdAt"
    ),
    Leave.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("employee", "firstName lastName"),
  ]);

  const employeeStats = departmentGroups.map((item: any) => ({
    department: departments.get(item._id?.toString() || "") || "Unassigned",
    count: item.count,
  }));

  const attendanceStats = {
    present: todaysAttendanceCount,
    absent: Math.max(activeEmployees - todaysAttendanceCount, 0),
    onLeave: employeesOnLeaveToday,
  };

  const leaveStats = {
    pending: leavePending,
    approved: leaveApproved,
    rejected: leaveRejected,
  };

  type Activity = { message: string; date: Date };

  const recentActivities: Activity[] = [];

  recentEmployees.forEach((employee: any) => {
    recentActivities.push({
      message: `${employee.firstName} ${employee.lastName} joined the organization`,
      date: employee.createdAt,
    });
  });

  recentLeaves.forEach((leave: any) => {
    const employeeName = leave.employee
      ? `${leave.employee.firstName} ${leave.employee.lastName}`
      : "An employee";

    recentActivities.push({
      message: `${employeeName} requested ${leave.leaveType} (${leave.status})`,
      date: leave.createdAt,
    });
  });

  recentActivities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    role: "Admin",
    stats: {
      totalEmployees,
      activeEmployees,
      employeesOnLeaveToday,
      departments: departmentsCount,
      todaysAttendance: todaysAttendanceCount,
    },
    employeeStats,
    attendanceStats,
    leaveStats,
    recentActivities: recentActivities.slice(0, 8),
  };
};

/* =========================================================
   EMPLOYEE DASHBOARD
========================================================= */

export const getEmployeeDashboardData = async (employeeId: string) => {
  const startOfDay = getStartOfDay();
  const endOfDay = getEndOfDay();
  const startOfYear = getStartOfYear();

  const [
    profile,
    todayAttendance,
    presentDaysThisMonth,
    leaveBalanceRaw,
    recentLeaveRequests,
  ] = await Promise.all([
    User.findById(employeeId).select("-password"),
    Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }),
    Attendance.countDocuments({
      employee: employeeId,
      status: "Present",
      date: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lte: endOfDay,
      },
    }),
    Leave.aggregate([
      {
        $match: {
          employee: new mongoose.Types.ObjectId(employeeId),
          status: "Approved",
          startDate: { $gte: startOfYear },
        },
      },
      {
        $group: {
          _id: "$leaveType",
          days: {
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
        },
      },
    ]),
    Leave.find({ employee: employeeId })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const leaveBalance = leaveBalanceRaw.map((item: any) => ({
    leaveType: item._id,
    used: Math.round(item.days),
  }));

  const recentActivities = recentLeaveRequests.map((leave: any) => ({
    message: `Leave request for ${leave.leaveType} is ${leave.status}`,
    date: leave.createdAt,
  }));

  const profileObject = profile?.toObject() || null;

  if (profileObject) {
    const [department, designation] = await Promise.all([
      profileObject.department
        ? Department.findById(profileObject.department).select("name").lean()
        : null,
      profileObject.designation
        ? Designation.findById(profileObject.designation).select("name").lean()
        : null,
    ]);

    (profileObject as any).departmentName =
      (department as any)?.name || "Unassigned";
    (profileObject as any).designationName =
      (designation as any)?.name || "Unassigned";
  }

  return {
    role: "Employee",
    profile: profileObject,
    attendanceSummary: {
      checkedInToday: Boolean(todayAttendance?.checkIn),
      checkedOutToday: Boolean(todayAttendance?.checkOut),
      checkIn: todayAttendance?.checkIn || null,
      checkOut: todayAttendance?.checkOut || null,
      status: todayAttendance?.status || "Not Marked",
      presentDaysThisMonth,
    },
    leaveBalance,
    recentLeaveRequests,
    recentActivities,
  };
};

