import api from "./api";

/* =========================================
   ADMIN DASHBOARD
========================================= */

export interface AdminDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  employeesOnLeaveToday: number;
  departments: number;
  todaysAttendance: number;
}

export interface EmployeeStat {
  department: string;
  count: number;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  onLeave: number;
}

export interface LeaveStats {
  pending: number;
  approved: number;
  rejected: number;
}

export interface RecentActivity {
  message: string;
  date: string;
}

export interface AdminDashboardData {
  role: "Admin";
  stats: AdminDashboardStats;
  employeeStats: EmployeeStat[];
  attendanceStats: AttendanceStats;
  leaveStats: LeaveStats;
  recentActivities: RecentActivity[];
}

/* =========================================
   EMPLOYEE DASHBOARD
========================================= */

export interface EmployeeProfile {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  departmentName?: string;
  designationName?: string;
  profileImage?: string;
  gender?: string;
  status?: string;
  dateOfJoining?: string;
}

export interface AttendanceSummary {
  checkedInToday: boolean;
  checkedOutToday: boolean;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  presentDaysThisMonth: number;
}

export interface LeaveBalanceItem {
  leaveType: string;
  used: number;
}

export interface LeaveRequestSummary {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
}

export interface EmployeeDashboardData {
  role: "Employee";
  profile: EmployeeProfile;
  attendanceSummary: AttendanceSummary;
  leaveBalance: LeaveBalanceItem[];
  recentLeaveRequests: LeaveRequestSummary[];
  recentActivities: RecentActivity[];
}

export type DashboardData = AdminDashboardData | EmployeeDashboardData;

/* =========================================
   GET DASHBOARD
========================================= */

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await api.get("/dashboard");

  return response.data.data;
};
