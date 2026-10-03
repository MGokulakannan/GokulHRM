import { useEffect, useState } from "react";
import { CalendarOff, Download, UserCheck, Users, Building2, Clock3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAttendanceReport,
  getEmployeeReport,
  getLeaveReport,
  getOverviewReport,
} from "../../services/reportService";
import PageHeader from "../../components/layout/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard, SkeletonRows } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/useToast";
import "./Reports.css";

interface OverviewData {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    employeesOnLeaveToday: number;
    departments: number;
    todaysAttendance: number;
  };
}

interface EmployeeReportData {
  byDepartment: { department: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byGender: { gender: string; count: number }[];
}

interface LeaveReportData {
  byType: { leaveType: string; totalDays: number; count: number }[];
  byStatus: { status: string; count: number }[];
}

interface AttendanceReportData {
  byStatus: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  Present: "#059669",
  Absent: "#e11d48",
  Leave: "#d97706",
};

const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const Reports = () => {
  const { showToast } = useToast();

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [employeeReport, setEmployeeReport] = useState<EmployeeReportData | null>(null);
  const [leaveReport, setLeaveReport] = useState<LeaveReportData | null>(null);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, employeeRes, leaveRes] = await Promise.all([
          getOverviewReport(),
          getEmployeeReport(),
          getLeaveReport(),
        ]);
        if (overviewRes.success) setOverview(overviewRes.data);
        if (employeeRes.success) setEmployeeReport(employeeRes.data);
        if (leaveRes.success) setLeaveReport(leaveRes.data);
      } catch (error) {
        console.error(error);
        showToast("Failed to load reports", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAttendanceReport(from || undefined, to || undefined)
      .then((res) => {
        if (res.success) setAttendanceReport(res.data);
      })
      .catch(() => showToast("Failed to load attendance report", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  if (loading) {
    return (
      <div className="gh-page">
        <div className="row g-3 mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="col-6 col-lg-3" key={index}>
              <SkeletonCard />
            </div>
          ))}
        </div>
        <div className="gh-card" style={{ padding: 20 }}>
          <SkeletonRows rows={6} />
        </div>
      </div>
    );
  }

  const departmentRows = employeeReport?.byDepartment || [];
  const leaveRows = leaveReport?.byType || [];
  const attendanceRows = attendanceReport?.byStatus || [];

  return (
    <div className="gh-page">
      <PageHeader title="Reports" description="Organization-wide statistics and breakdowns" />

      {overview && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <StatCard icon={<Users />} label="Total Employees" value={overview.stats.totalEmployees} tone="primary" />
          </div>
          <div className="col-6 col-lg-3">
            <StatCard icon={<UserCheck />} label="Active Employees" value={overview.stats.activeEmployees} tone="success" />
          </div>
          <div className="col-6 col-lg-3">
            <StatCard icon={<Building2 />} label="Departments" value={overview.stats.departments} tone="accent" />
          </div>
          <div className="col-6 col-lg-3">
            <StatCard icon={<CalendarOff />} label="On Leave Today" value={overview.stats.employeesOnLeaveToday} tone="warning" />
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        {/* ATTENDANCE (date-filtered) */}
        <div className="col-lg-6">
          <div className="gh-card rep-panel">
            <div className="rep-panel-header">
              <h2>Attendance by Status</h2>
              <div className="rep-range">
                <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
                <input type="date" className="form-control" min={from} value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
              </div>
            </div>
            {attendanceRows.length === 0 ? (
              <EmptyState icon={<Clock3 size={20} />} title="No attendance in this range" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={attendanceRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {attendanceRows.map((row) => (
                      <Cell key={row.status} fill={STATUS_COLORS[row.status] || "#4f46e5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* EMPLOYEES BY DEPARTMENT */}
        <div className="col-lg-6">
          <div className="gh-card rep-panel">
            <div className="rep-panel-header">
              <h2>Employees by Department</h2>
              {departmentRows.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={() =>
                    downloadCsv("employees-by-department.csv", [
                      ["Department", "Employees"],
                      ...departmentRows.map((row) => [row.department, row.count]),
                    ])
                  }
                >
                  <Download size={13} /> CSV
                </button>
              )}
            </div>
            {departmentRows.length === 0 ? (
              <EmptyState title="No data available" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={departmentRows} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="department" width={110} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* LEAVE BY TYPE */}
        <div className="col-lg-7">
          <div className="gh-card rep-panel">
            <div className="rep-panel-header">
              <h2>Approved Leave by Type</h2>
              {leaveRows.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={() =>
                    downloadCsv("leave-by-type.csv", [
                      ["Leave Type", "Requests", "Total Days"],
                      ...leaveRows.map((row) => [row.leaveType, row.count, row.totalDays]),
                    ])
                  }
                >
                  <Download size={13} /> CSV
                </button>
              )}
            </div>
            {leaveRows.length === 0 ? (
              <EmptyState title="No approved leave yet" />
            ) : (
              <div className="table-responsive">
                <table className="table gh-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th className="text-end">Requests</th>
                      <th className="text-end">Total Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRows.map((row) => (
                      <tr key={row.leaveType}>
                        <td>{row.leaveType}</td>
                        <td className="text-end">{row.count}</td>
                        <td className="text-end">{row.totalDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* COMPOSITION */}
        <div className="col-lg-5">
          <div className="gh-card rep-panel">
            <h2>Workforce Composition</h2>
            <div className="rep-split">
              <div>
                <h3>By Status</h3>
                {employeeReport?.byStatus.map((item) => (
                  <div className="rep-mini-row" key={item.status}>
                    <span>{item.status}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
              <div>
                <h3>By Gender</h3>
                {employeeReport?.byGender.map((item) => (
                  <div className="rep-mini-row" key={item.gender}>
                    <span>{item.gender}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>
            <h3 style={{ marginTop: 20 }}>Leave Requests</h3>
            {leaveReport?.byStatus.map((item) => (
              <div className="rep-mini-row" key={item.status}>
                <span>{item.status}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
