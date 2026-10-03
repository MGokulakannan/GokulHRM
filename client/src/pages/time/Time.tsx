import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { Clock3, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getMyAttendance,
} from "../../services/attendanceServices";
import type { AttendanceRecord } from "../../services/attendanceServices";
import PageHeader from "../../components/layout/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import Pagination from "../../components/pagination/Pagination";
import { useToast } from "../../components/ui/useToast";
import "./Time.css";

const PAGE_SIZE = 10;

const toLocalDateKey = (value: string | Date) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatHours = (ms: number) => {
  if (ms <= 0) return "0h 0m";
  const totalMinutes = Math.floor(ms / 60000);
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
};

const getWorkedMs = (record?: AttendanceRecord, now: number = Date.now()) => {
  if (!record?.checkIn) return 0;
  const start = new Date(record.checkIn).getTime();
  const end = record.checkOut ? new Date(record.checkOut).getTime() : now;
  return Math.max(end - start, 0);
};

const getEmployeeLabel = (employee: AttendanceRecord["employee"]) =>
  typeof employee === "object" && employee
    ? `${employee.firstName} ${employee.lastName}`
    : "-";

const AttendanceTable = ({
  records,
  showEmployee,
  now,
}: {
  records: AttendanceRecord[];
  showEmployee?: boolean;
  now: number;
}) => {
  const [requestedPage, setPage] = useState(1);

  // Clamp rather than reset-in-effect so a shrinking result set never strands the user on an empty page.
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const paginated = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="table-responsive">
        <table className="table gh-table align-middle mb-0">
          <thead>
            <tr>
              {showEmployee && <th>Employee</th>}
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((record) => (
              <tr key={record._id}>
                {showEmployee && <td>{getEmployeeLabel(record.employee)}</td>}
                <td>{formatDate(record.date)}</td>
                <td>{formatTime(record.checkIn)}</td>
                <td>{formatTime(record.checkOut)}</td>
                <td>{record.checkIn ? formatHours(getWorkedMs(record, now)) : "-"}</td>
                <td>
                  <StatusBadge status={record.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={page}
        totalItems={records.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </>
  );
};

const DateRangeFilter = ({
  from,
  to,
  onFromChange,
  onToChange,
  onReset,
}: {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
}) => (
  <div className="att-filters">
    <div>
      <label htmlFor="att-from">From</label>
      <input id="att-from" type="date" className="form-control" value={from} onChange={(e) => onFromChange(e.target.value)} />
    </div>
    <div>
      <label htmlFor="att-to">To</label>
      <input id="att-to" type="date" className="form-control" min={from} value={to} onChange={(e) => onToChange(e.target.value)} />
    </div>
    <button type="button" className="btn btn-outline-primary" onClick={onReset} disabled={!from && !to}>
      Reset
    </button>
  </div>
);

const Attendance = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const [myFrom, setMyFrom] = useState("");
  const [myTo, setMyTo] = useState("");
  const [orgFrom, setOrgFrom] = useState("");
  const [orgTo, setOrgTo] = useState("");

  // Keep the live "hours worked" counter fresh while the user is checked in.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const todayKey = toLocalDateKey(new Date());

  const todayRecord = myRecords.find((record) => toLocalDateKey(record.date) === todayKey);

  const loadMyAttendance = useCallback(async () => {
    try {
      const response = await getMyAttendance(myFrom || undefined, myTo || undefined);
      if (response.success) setMyRecords(response.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load attendance history", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myFrom, myTo]);

  const loadAllAttendance = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await getAllAttendance({ from: orgFrom || undefined, to: orgTo || undefined });
      if (response.success) setAllRecords(response.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load organization attendance", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, orgFrom, orgTo]);

  useEffect(() => {
    const load = async () => {
      await Promise.all([loadMyAttendance(), loadAllAttendance()]);
      setLoading(false);
    };
    load();
  }, [loadMyAttendance, loadAllAttendance]);

  const handleAction = async (action: "in" | "out") => {
    setActionLoading(true);
    try {
      const response = action === "in" ? await checkIn() : await checkOut();
      showToast(response.message || (action === "in" ? "Checked in" : "Checked out"), "success");
      await Promise.all([loadMyAttendance(), loadAllAttendance()]);
    } catch (error) {
      showToast(getApiError(error, `Failed to check ${action}`), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const monthSummary = useMemo(() => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const thisMonth = myRecords.filter((record) => {
      const date = new Date(record.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
    return {
      presentDays: thisMonth.filter((r) => r.status === "Present").length,
      totalMs: thisMonth.reduce((sum, record) => sum + getWorkedMs(record, now), 0),
    };
  }, [myRecords, now]);

  const checkedIn = Boolean(todayRecord?.checkIn);
  const checkedOut = Boolean(todayRecord?.checkOut);
  const statusLabel = checkedOut ? "Checked Out" : checkedIn ? "Checked In" : "Not Checked In";

  return (
    <div className="gh-page">
      <PageHeader
        title="Attendance"
        description={new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />

      {/* TODAY */}
      <div className="gh-card att-today">
        <div className="att-today-main">
          <div className="att-today-status">
            <span className="att-today-label">Today's status</span>
            <StatusBadge
              status={statusLabel}
              tone={checkedOut ? "info" : checkedIn ? "success" : "warning"}
            />
          </div>
          <div className="att-today-times">
            <div>
              <span>Check in</span>
              <strong>{formatTime(todayRecord?.checkIn)}</strong>
            </div>
            <div>
              <span>Check out</span>
              <strong>{formatTime(todayRecord?.checkOut)}</strong>
            </div>
            <div>
              <span>Hours today</span>
              <strong>{checkedIn ? formatHours(getWorkedMs(todayRecord, now)) : "-"}</strong>
            </div>
          </div>
        </div>
        <div className="att-today-actions">
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={() => handleAction("in")}
            disabled={actionLoading || checkedIn}
          >
            <LogIn size={15} /> Check In
          </button>
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-1"
            onClick={() => handleAction("out")}
            disabled={actionLoading || !checkedIn || checkedOut}
          >
            <LogOut size={15} /> Check Out
          </button>
        </div>
      </div>

      {/* MONTH SUMMARY */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <StatCard icon={<Clock3 />} label="Present days this month" value={monthSummary.presentDays} tone="success" />
        </div>
        <div className="col-6">
          <StatCard icon={<Clock3 />} label="Hours logged this month" value={formatHours(monthSummary.totalMs)} tone="info" />
        </div>
      </div>

      {/* MY HISTORY */}
      <div className="gh-card att-section">
        <div className="att-section-header">
          <h2>My Attendance History</h2>
          <DateRangeFilter
            from={myFrom}
            to={myTo}
            onFromChange={setMyFrom}
            onToChange={setMyTo}
            onReset={() => {
              setMyFrom("");
              setMyTo("");
            }}
          />
        </div>
        {loading ? (
          <div style={{ padding: 20 }}>
            <SkeletonRows rows={4} />
          </div>
        ) : myRecords.length === 0 ? (
          <EmptyState title="No attendance records" description="Your check-ins will appear here." />
        ) : (
          <AttendanceTable records={myRecords} now={now} />
        )}
      </div>

      {/* ADMIN: ORGANIZATION */}
      {isAdmin && (
        <div className="gh-card att-section">
          <div className="att-section-header">
            <h2>Organization Attendance</h2>
            <DateRangeFilter
              from={orgFrom}
              to={orgTo}
              onFromChange={setOrgFrom}
              onToChange={setOrgTo}
              onReset={() => {
                setOrgFrom("");
                setOrgTo("");
              }}
            />
          </div>
          {allRecords.length === 0 ? (
            <EmptyState title="No attendance records found" description="Try widening the date range." />
          ) : (
            <AttendanceTable records={allRecords} showEmployee now={now} />
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
