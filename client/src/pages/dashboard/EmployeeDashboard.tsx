import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  Mail,
  Phone,
  Target,
  User,
  UserCircle,
  BadgeCheck,
  CalendarDays,
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { useToast } from "../../components/ui/useToast";
import { isModuleEnabled, useModules } from "../../context/modulesStore";
import { getApiError } from "../../utils/apiError";
import { checkIn, checkOut, getMyAttendance } from "../../services/attendanceServices";
import type { AttendanceRecord } from "../../services/attendanceServices";
import type { EmployeeDashboardData } from "../../services/dashboardService";
import { getLeaveTypes } from "../../services/leaveTypeService";
import type { LeaveType } from "../../services/leaveTypeService";
import { getGoals, getReviews } from "../../services/performanceService";
import type { GoalRecord, PerformanceReviewRecord } from "../../services/performanceService";
import "./EmployeeDashboard.css";

/* ---------- helpers ---------- */

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value?: string | null) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
};

const formatTime = (value?: string | null) => {
  const date = parseDate(value);
  return date ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-";
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const formatDuration = (from: string, to: string) => {
  const start = parseDate(from);
  const end = parseDate(to);
  if (!start || !end) return "-";

  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
};

const formatTenure = (joined?: string) => {
  const date = parseDate(joined);
  if (!date) return null;

  const now = new Date();
  let months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  if (now.getDate() < date.getDate()) months -= 1;
  if (months < 1) return "Just joined";

  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years ? `${years} yr${years > 1 ? "s" : ""}` : "", rest ? `${rest} mo` : ""].filter(Boolean).join(" ");
};

const toIsoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Monday → Sunday of the current week.
const getWeekDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
};

const ProgressBar = ({ value, label }: { value: number; label: string }) => (
  <div
    className="emp-progress"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value)}
  >
    <div className="emp-progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

interface EmployeeDashboardProps {
  data: EmployeeDashboardData;
  onRefresh?: () => Promise<void> | void;
}

const EmployeeDashboard = ({ data, onRefresh }: EmployeeDashboardProps) => {
  const { profile, attendanceSummary, leaveBalance, recentLeaveRequests, recentActivities } = data;

  const { showToast } = useToast();
  const modules = useModules();
  const attendanceOn = isModuleEnabled(modules, "attendance");
  const leaveOn = isModuleEnabled(modules, "leave");
  const performanceOn = isModuleEnabled(modules, "performance");

  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [reviews, setReviews] = useState<PerformanceReviewRecord[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [weekRecords, setWeekRecords] = useState<AttendanceRecord[]>([]);
  const [acting, setActing] = useState(false);

  const weekDays = useMemo(() => getWeekDays(), []);

  // Secondary widgets load independently so one failure never blanks the page.
  useEffect(() => {
    let cancelled = false;
    const from = toIsoDay(weekDays[0]);
    const to = toIsoDay(weekDays[6]);

    const run = <T,>(request: Promise<T>, apply: (value: T) => void) =>
      request.then((value) => !cancelled && apply(value)).catch((error) => console.error(error));

    if (performanceOn) {
      run(getGoals(), (res) => setGoals(res.data || []));
      run(getReviews(), (res) => setReviews(res.data || []));
    }
    if (leaveOn) run(getLeaveTypes(), (res) => setLeaveTypes(res.data || []));
    if (attendanceOn) run(getMyAttendance(from, to), (res) => setWeekRecords(res.data || []));

    return () => {
      cancelled = true;
    };
  }, [weekDays, attendanceOn, leaveOn, performanceOn, attendanceSummary.checkedInToday, attendanceSummary.checkedOutToday]);

  const handlePunch = async (action: "in" | "out") => {
    setActing(true);
    try {
      const response = action === "in" ? await checkIn() : await checkOut();
      showToast(response.message || (action === "in" ? "Checked in" : "Checked out"), "success");
      await onRefresh?.();
    } catch (error) {
      showToast(getApiError(error, `Failed to check ${action}`), "error");
    } finally {
      setActing(false);
    }
  };

  /* ---------- derived data ---------- */

  const usedByType = useMemo(
    () => new Map(leaveBalance.map((item) => [item.leaveType.toLowerCase(), item.used])),
    [leaveBalance]
  );

  const balances = useMemo(
    () =>
      leaveTypes
        .filter((type) => type.status === "Active")
        .map((type) => {
          const used = usedByType.get(type.name.toLowerCase()) ?? 0;
          return { name: type.name, total: type.daysPerYear, used, remaining: Math.max(type.daysPerYear - used, 0) };
        }),
    [leaveTypes, usedByType]
  );

  const totalRemaining = balances.reduce((sum, item) => sum + item.remaining, 0);
  const totalUsed = leaveBalance.reduce((sum, item) => sum + item.used, 0);
  const pendingLeaveCount = recentLeaveRequests.filter((leave) => leave.status === "Pending").length;

  const activeGoals = goals.filter((goal) => goal.status !== "Completed");
  const averageProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / activeGoals.length)
    : 0;

  const pendingReviews = reviews.filter((review) => review.status === "Pending");

  const recordByDay = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    weekRecords.forEach((record) => {
      const date = parseDate(record.date);
      if (date) map.set(toIsoDay(date), record);
    });
    return map;
  }, [weekRecords]);

  const todayKey = toIsoDay(new Date());
  const tenure = formatTenure(profile.dateOfJoining);
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const dayState = (day: Date) => {
    const key = toIsoDay(day);
    const record = recordByDay.get(key);
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

    if (record) return { label: record.status, tone: record.status.toLowerCase() };
    if (key > todayKey) return { label: "Upcoming", tone: "upcoming" };
    if (key === todayKey) return { label: attendanceSummary.checkedInToday ? "Present" : "Not yet", tone: attendanceSummary.checkedInToday ? "present" : "upcoming" };
    return isWeekend ? { label: "Weekend", tone: "weekend" } : { label: "No record", tone: "none" };
  };

  return (
    <div className="gh-page emp-dashboard">
      {/* ---------- HERO ---------- */}
      <section className="emp-hero">
        <div className="emp-hero-identity">
          <div className="emp-hero-avatar" aria-hidden="true">
            {profile.firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="emp-hero-greeting">{getGreeting()},</p>
            <h1>{profile.firstName}</h1>
            <p className="emp-hero-role">
              {profile.designationName || "Employee"} · {profile.departmentName || "Unassigned"}
            </p>
            <div className="emp-hero-chips">
              <span className="emp-chip">
                <BadgeCheck size={13} /> {profile.employeeId}
              </span>
              {profile.dateOfJoining && (
                <span className="emp-chip">
                  <CalendarDays size={13} /> Joined {formatDate(profile.dateOfJoining)}
                  {tenure && ` · ${tenure}`}
                </span>
              )}
              {profile.status && <span className="emp-chip">{profile.status}</span>}
            </div>
          </div>
        </div>

        {attendanceOn && (
          <div className="emp-today" aria-label="Today's attendance">
            <div className="emp-today-head">
              <span>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <StatusBadge
                status={attendanceSummary.checkedOutToday ? "Completed" : attendanceSummary.checkedInToday ? "Checked In" : "Not Marked"}
              />
            </div>

            <div className="emp-today-times">
              <div>
                <span>Check in</span>
                <strong>{formatTime(attendanceSummary.checkIn)}</strong>
              </div>
              <div>
                <span>Check out</span>
                <strong>{formatTime(attendanceSummary.checkOut)}</strong>
              </div>
              <div>
                <span>Worked</span>
                <strong>
                  {attendanceSummary.checkIn && attendanceSummary.checkOut
                    ? formatDuration(attendanceSummary.checkIn, attendanceSummary.checkOut)
                    : "-"}
                </strong>
              </div>
            </div>

            {!attendanceSummary.checkedInToday ? (
              <button className="emp-punch emp-punch-in" onClick={() => handlePunch("in")} disabled={acting}>
                <LogIn size={16} /> {acting ? "Checking in..." : "Check in now"}
              </button>
            ) : !attendanceSummary.checkedOutToday ? (
              <button className="emp-punch emp-punch-out" onClick={() => handlePunch("out")} disabled={acting}>
                <LogOut size={16} /> {acting ? "Checking out..." : "Check out"}
              </button>
            ) : (
              <div className="emp-punch-done">
                <CheckCircle2 size={16} /> Your day is complete
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- KPI ROW ---------- */}
      <div className="row g-3 mb-4">
        {attendanceOn && (
          <div className="col-6 col-xl-3">
            <StatCard
              icon={<CalendarCheck />}
              label="Days present this month"
              value={attendanceSummary.presentDaysThisMonth}
              tone="success"
            />
          </div>
        )}
        {leaveOn && (
          <>
            <div className="col-6 col-xl-3">
              <StatCard
                icon={<CalendarClock />}
                label={balances.length ? "Leave days remaining" : "Leave days taken (YTD)"}
                value={balances.length ? totalRemaining : totalUsed}
                tone="info"
              />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard icon={<Clock3 />} label="Pending leave requests" value={pendingLeaveCount} tone="warning" />
            </div>
          </>
        )}
        {performanceOn && (
          <div className="col-6 col-xl-3">
            <StatCard
              icon={<Target />}
              label={activeGoals.length ? `Goals in progress · ${averageProgress}% avg` : "Goals in progress"}
              value={activeGoals.length}
              tone="accent"
            />
          </div>
        )}
      </div>

      <div className="row g-3">
        {/* ---------- MAIN COLUMN ---------- */}
        <div className="col-12 col-xl-8 d-flex flex-column gap-3">
          {attendanceOn && (
            <section className="gh-card dash-panel">
              <header className="emp-panel-head">
                <h2>This week</h2>
                <Link to="/attendance">Attendance history</Link>
              </header>
              <div className="emp-week">
                {weekDays.map((day) => {
                  const state = dayState(day);
                  const record = recordByDay.get(toIsoDay(day));
                  const isToday = toIsoDay(day) === todayKey;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`emp-week-day emp-week-${state.tone} ${isToday ? "is-today" : ""}`.trim()}
                    >
                      <span className="emp-week-name">{day.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                      <span className="emp-week-date">{day.getDate()}</span>
                      <span className="emp-week-state">{state.label}</span>
                      <span className="emp-week-time">{record?.checkIn ? formatTime(record.checkIn) : " "}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {leaveOn && (
            <section className="gh-card dash-panel">
              <header className="emp-panel-head">
                <h2>Leave balance</h2>
                <Link to="/leave">Apply for leave</Link>
              </header>
              {balances.length === 0 ? (
                leaveBalance.length === 0 ? (
                  <EmptyState title="No leave types are set up yet" description="Your administrator hasn't configured leave allowances." />
                ) : (
                  <ul className="leave-balance-list">
                    {leaveBalance.map((item) => (
                      <li key={item.leaveType}>
                        <span>{item.leaveType}</span>
                        <strong>{item.used} days taken</strong>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <div className="emp-balance-grid">
                  {balances.map((item) => (
                    <div className="emp-balance" key={item.name}>
                      <div className="emp-balance-top">
                        <strong>{item.name}</strong>
                        <span>
                          {item.remaining} of {item.total} left
                        </span>
                      </div>
                      <ProgressBar
                        value={item.total ? (item.used / item.total) * 100 : 0}
                        label={`${item.name}: ${item.used} of ${item.total} days used`}
                      />
                      <small>{item.used} used</small>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {leaveOn && (
            <section className="gh-card dash-panel">
              <header className="emp-panel-head">
                <h2>My leave requests</h2>
                <Link to="/leave">View all</Link>
              </header>
              {recentLeaveRequests.length === 0 ? (
                <EmptyState title="No leave requests yet" description="Requests you submit will show up here with their status." />
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
            </section>
          )}
        </div>

        {/* ---------- SIDE COLUMN ---------- */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-3">
          <section className="gh-card dash-panel">
            <header className="emp-panel-head">
              <h2>Quick actions</h2>
            </header>
            <div className="emp-actions">
              {attendanceOn && (
                <Link to="/attendance" className="emp-action">
                  <Clock3 size={16} /> Attendance
                </Link>
              )}
              {leaveOn && (
                <Link to="/leave" className="emp-action">
                  <CalendarClock size={16} /> Apply for leave
                </Link>
              )}
              {performanceOn && (
                <Link to="/performance" className="emp-action">
                  <Target size={16} /> My goals
                </Link>
              )}
              <Link to="/my-info" className="emp-action">
                <UserCircle size={16} /> My profile
              </Link>
            </div>
          </section>

          <section className="gh-card dash-panel">
            <header className="emp-panel-head">
              <h2>Personal details</h2>
              <Link to="/my-info">Edit</Link>
            </header>
            <dl className="emp-details">
              <div>
                <dt>
                  <User size={14} /> Full name
                </dt>
                <dd>{fullName}</dd>
              </div>
              <div>
                <dt>
                  <Mail size={14} /> Email
                </dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>
                  <Phone size={14} /> Phone
                </dt>
                <dd>{profile.phone || "-"}</dd>
              </div>
              <div>
                <dt>
                  <Building2 size={14} /> Department
                </dt>
                <dd>{profile.departmentName || "-"}</dd>
              </div>
              <div>
                <dt>
                  <BadgeCheck size={14} /> Designation
                </dt>
                <dd>{profile.designationName || "-"}</dd>
              </div>
              {profile.gender && (
                <div>
                  <dt>
                    <User size={14} /> Gender
                  </dt>
                  <dd>{profile.gender}</dd>
                </div>
              )}
            </dl>
          </section>

          {performanceOn && (
            <section className="gh-card dash-panel">
              <header className="emp-panel-head">
                <h2>Goals & reviews</h2>
                <Link to="/performance">Open</Link>
              </header>
              {activeGoals.length === 0 && pendingReviews.length === 0 ? (
                <EmptyState title="Nothing in progress" description="Goals and reviews assigned to you will appear here." />
              ) : (
                <>
                  <ul className="emp-goals">
                    {activeGoals.slice(0, 4).map((goal) => (
                      <li key={goal._id}>
                        <div className="emp-goal-top">
                          <strong>{goal.title}</strong>
                          <span>{goal.progress || 0}%</span>
                        </div>
                        <ProgressBar value={goal.progress || 0} label={`${goal.title} progress`} />
                      </li>
                    ))}
                  </ul>
                  {pendingReviews.length > 0 && (
                    <div className="emp-review-note">
                      {pendingReviews.length} performance review{pendingReviews.length > 1 ? "s" : ""} pending
                      {pendingReviews[0].dueDate && ` · due ${formatDate(pendingReviews[0].dueDate)}`}
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          <section className="gh-card dash-panel">
            <header className="emp-panel-head">
              <h2>Recent activity</h2>
            </header>
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
