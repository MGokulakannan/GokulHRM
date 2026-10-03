import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, CalendarCheck, CalendarClock, Target } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import type { EmployeeDashboardData } from "../../services/dashboardService";
import { getGoals } from "../../services/performanceService";
import type { GoalRecord } from "../../services/performanceService";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const EmployeeDashboard = ({ data }: { data: EmployeeDashboardData }) => {
  const { profile, attendanceSummary, leaveBalance, recentLeaveRequests, recentActivities } =
    data;

  const [goals, setGoals] = useState<GoalRecord[]>([]);

  useEffect(() => {
    getGoals()
      .then((res) => {
        if (res.success) setGoals(res.data || []);
      })
      .catch((error) => console.error("Failed to load goals:", error));
  }, []);

  const pendingLeaveCount = recentLeaveRequests.filter((l) => l.status === "Pending").length;
  const activeGoalsCount = goals.filter((g) => g.status !== "Completed").length;
  const totalLeaveUsed = leaveBalance.reduce((sum, item) => sum + item.used, 0);

  return (
    <div className="gh-page">
      <div className="dash-welcome">
        <div>
          <h1>
            {getGreeting()}, {profile.firstName}
          </h1>
          <p>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            &middot; Here's what's happening with your work today
          </p>
        </div>
        <div className="dash-welcome-actions">
          <Link to="/attendance" className="btn btn-primary d-flex align-items-center gap-1">
            <Clock3 size={15} /> Go to Attendance
          </Link>
          <Link to="/leave" className="btn btn-outline-primary d-flex align-items-center gap-1">
            <CalendarClock size={15} /> Apply for Leave
          </Link>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard
            icon={<CalendarCheck />}
            label="Attendance Today"
            value={attendanceSummary.checkedInToday ? "Checked In" : "Not Checked In"}
            tone={attendanceSummary.checkedInToday ? "success" : "warning"}
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<CalendarClock />} label="Leave Taken (YTD)" value={totalLeaveUsed} tone="info" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<Clock3 />} label="Pending Leave Requests" value={pendingLeaveCount} tone="warning" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<Target />} label="Active Goals" value={activeGoalsCount} tone="accent" />
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* PROFILE CARD */}
        <div className="col-lg-4">
          <div className="gh-card dash-panel h-100">
            <h2>My Profile</h2>
            <div className="profile-summary">
              <div className="profile-summary-avatar">
                {profile.firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>
                  {profile.firstName} {profile.lastName}
                </strong>
                <div className="profile-summary-meta">{profile.employeeId}</div>
              </div>
            </div>
            <dl className="info-list">
              <div>
                <dt>Department</dt>
                <dd>{profile.departmentName || "-"}</dd>
              </div>
              <div>
                <dt>Designation</dt>
                <dd>{profile.designationName || "-"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
            </dl>
            <Link to="/my-info" className="btn btn-outline-primary btn-sm mt-2">
              View Full Profile
            </Link>
          </div>
        </div>

        {/* ATTENDANCE SUMMARY */}
        <div className="col-lg-4">
          <div className="gh-card dash-panel h-100">
            <h2>Attendance Summary</h2>
            <div className="attendance-status-row">
              <StatusBadge status={attendanceSummary.checkedInToday ? "Checked In" : "Not Marked"} />
            </div>
            <dl className="info-list">
              <div>
                <dt>Check In</dt>
                <dd>{formatTime(attendanceSummary.checkIn)}</dd>
              </div>
              <div>
                <dt>Check Out</dt>
                <dd>{formatTime(attendanceSummary.checkOut)}</dd>
              </div>
              <div>
                <dt>Present Days (This Month)</dt>
                <dd>{attendanceSummary.presentDaysThisMonth}</dd>
              </div>
            </dl>
            <Link to="/attendance" className="btn btn-primary btn-sm mt-2">
              Go to Attendance
            </Link>
          </div>
        </div>

        {/* LEAVE BALANCE */}
        <div className="col-lg-4">
          <div className="gh-card dash-panel h-100">
            <h2>Leave Taken This Year</h2>
            {leaveBalance.length === 0 ? (
              <EmptyState title="No approved leave yet" />
            ) : (
              <ul className="leave-balance-list">
                {leaveBalance.map((item) => (
                  <li key={item.leaveType}>
                    <span>{item.leaveType}</span>
                    <strong>{item.used} days</strong>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/leave" className="btn btn-outline-primary btn-sm mt-2">
              Apply for Leave
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* RECENT LEAVE REQUESTS */}
        <div className="col-lg-6">
          <div className="gh-card dash-panel h-100">
            <h2>Recent Leave Requests</h2>
            {recentLeaveRequests.length === 0 ? (
              <EmptyState title="No leave requests yet" />
            ) : (
              <div className="table-responsive">
                <table className="table gh-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaveRequests.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave.leaveType}</td>
                        <td>{formatDate(leave.startDate)}</td>
                        <td>{formatDate(leave.endDate)}</td>
                        <td>
                          <StatusBadge status={leave.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default EmployeeDashboard;
