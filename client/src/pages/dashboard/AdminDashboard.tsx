import { Link } from "react-router-dom";
import { Users, UserCheck, CalendarOff, Clock3, UserPlus, FileBarChart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import StatCard from "../../components/dashboard/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import type { AdminDashboardData } from "../../services/dashboardService";
import { useAuth } from "../../context/useAuth";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const ATTENDANCE_COLORS = ["#059669", "#e11d48", "#d97706"];
const LEAVE_COLORS = ["#d97706", "#059669", "#e11d48"];

const AdminDashboard = ({ data }: { data: AdminDashboardData }) => {
  const { user } = useAuth();
  const { stats, employeeStats, attendanceStats, leaveStats, recentActivities } = data;

  const maxDeptCount = Math.max(...employeeStats.map((item) => item.count), 1);

  const attendanceChartData = [
    { name: "Present", value: attendanceStats.present },
    { name: "Absent", value: attendanceStats.absent },
    { name: "On Leave", value: attendanceStats.onLeave },
  ];

  const leaveChartData = [
    { name: "Pending", value: leaveStats.pending },
    { name: "Approved", value: leaveStats.approved },
    { name: "Rejected", value: leaveStats.rejected },
  ];

  const hasAttendanceData = attendanceChartData.some((item) => item.value > 0);
  const hasLeaveData = leaveChartData.some((item) => item.value > 0);

  return (
    <div className="gh-page">
      {/* WELCOME */}
      <div className="dash-welcome">
        <div>
          <h1>
            {getGreeting()}, {user?.firstName}
          </h1>
          <p>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            &middot; Here's what's happening across your organization
          </p>
        </div>
        <div className="dash-welcome-actions">
          <Link to="/employees" className="btn btn-primary d-flex align-items-center gap-1">
            <UserPlus size={15} /> Add Employee
          </Link>
          <Link to="/reports" className="btn btn-outline-primary d-flex align-items-center gap-1">
            <FileBarChart size={15} /> View Reports
          </Link>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon={<Users />} label="Total Employees" value={stats.totalEmployees} tone="primary" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<UserCheck />} label="Active Employees" value={stats.activeEmployees} tone="success" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<CalendarOff />} label="On Leave" value={stats.employeesOnLeaveToday} tone="warning" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<Clock3 />} label="Present Today" value={stats.todaysAttendance} tone="info" />
        </div>
      </div>

      {/* CHARTS */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="gh-card dash-panel">
            <h2>Attendance Overview</h2>
            {!hasAttendanceData ? (
              <EmptyState title="No attendance data yet" description="Check-ins will appear here once recorded." />
            ) : (
              <div className="dash-chart-row">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {attendanceChartData.map((_, index) => (
                        <Cell key={index} fill={ATTENDANCE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="gh-card dash-panel">
            <h2>Leave Request Distribution</h2>
            {!hasLeaveData ? (
              <EmptyState title="No leave requests yet" />
            ) : (
              <div className="dash-chart-row">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={leaveChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {leaveChartData.map((_, index) => (
                        <Cell key={index} fill={LEAVE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* EMPLOYEES BY DEPARTMENT */}
        <div className="col-lg-6">
          <div className="gh-card dash-panel h-100">
            <h2>Employees by Department</h2>
            {employeeStats.length === 0 ? (
              <EmptyState title="No employee data yet" />
            ) : (
              <div className="bar-list">
                {employeeStats.map((item) => (
                  <div className="bar-row" key={item.department}>
                    <span className="bar-label">{item.department}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(item.count / maxDeptCount) * 100}%` }}
                      />
                    </div>
                    <span className="bar-count">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="col-lg-6">
          <div className="gh-card dash-panel h-100">
            <h2>Recent Activity</h2>
            {recentActivities.length === 0 ? (
              <EmptyState title="No recent activity" />
            ) : (
              <ul className="activity-list">
                {recentActivities.map((activity, index) => (
                  <li key={index}>
                    <span className="activity-dot" />
                    <span className="activity-message">{activity.message}</span>
                    <span className="activity-date">{formatDate(activity.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
