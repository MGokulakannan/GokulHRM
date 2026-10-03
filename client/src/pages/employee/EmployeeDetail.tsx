import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Pencil, Phone } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/useToast";
import { getEmployeeById } from "../../services/employeeService";
import { getDepartments } from "../../services/departmentService";
import { getDesignations } from "../../services/designationService";
import { getAllAttendance } from "../../services/attendanceServices";
import type { AttendanceRecord } from "../../services/attendanceServices";
import api from "../../services/api";
import { getReviews, getGoals } from "../../services/performanceService";
import type { PerformanceReviewRecord, GoalRecord } from "../../services/performanceService";
import "./EmployeeDetail.css";

interface EmployeeData {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string | { _id: string; name: string };
  designation?: string | { _id: string; name: string };
  phone?: string;
  gender?: string;
  status: string;
  dateOfJoining?: string;
}

interface LookupItem {
  _id: string;
  name: string;
}

interface LeaveRecord {
  _id: string;
  employee: string | { _id: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

const tabs = ["Overview", "Personal Information", "Job Details", "Attendance", "Leave History", "Performance"] as const;

type Tab = (typeof tabs)[number];

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getId = (value: string | { _id: string } | undefined) =>
  typeof value === "object" && value ? value._id : value;

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [designations, setDesignations] = useState<LookupItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [reviews, setReviews] = useState<PerformanceReviewRecord[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [empRes, deptRes, desigRes, attRes, leaveRes, reviewRes, goalRes] =
          await Promise.all([
            getEmployeeById(id),
            getDepartments(),
            getDesignations(),
            getAllAttendance({ employee: id }),
            api.get("/leaves"),
            getReviews(),
            getGoals(),
          ]);

        if (empRes.success) setEmployee(empRes.data);
        if (deptRes.success) setDepartments(deptRes.data || []);
        if (desigRes.success) setDesignations(desigRes.data || []);
        if (attRes.success) setAttendance(attRes.data || []);

        const leaveData: LeaveRecord[] = leaveRes.data?.data || [];
        setLeaves(leaveData.filter((leave) => getId(leave.employee) === id));

        if (reviewRes.success) {
          setReviews((reviewRes.data || []).filter((r: PerformanceReviewRecord) => getId(r.employee) === id));
        }
        if (goalRes.success) {
          setGoals((goalRes.data || []).filter((g: GoalRecord) => getId(g.employee) === id));
        }
      } catch (error) {
        console.error(error);
        showToast("Failed to load employee details", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getDeptName = (value?: string | { _id: string; name: string }) => {
    const deptId = getId(value);
    return departments.find((d) => d._id === deptId)?.name || "-";
  };

  const getDesigName = (value?: string | { _id: string; name: string }) => {
    const desigId = getId(value);
    return designations.find((d) => d._id === desigId)?.name || "-";
  };

  if (loading) {
    return (
      <div className="gh-page">
        <SkeletonRows rows={8} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="gh-page">
        <EmptyState title="Employee not found" description="This employee may have been removed." />
      </div>
    );
  }

  return (
    <div className="gh-page">
      <button className="emp-detail-back" onClick={() => navigate("/employees")}>
        <ArrowLeft size={15} /> Back to Employees
      </button>

      <div className="gh-card emp-detail-header">
        <div className="emp-detail-avatar">
          {employee.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="emp-detail-heading">
          <div className="emp-detail-name-row">
            <h1>
              {employee.firstName} {employee.lastName}
            </h1>
            <StatusBadge status={employee.status} />
          </div>
          <p>
            {getDesigName(employee.designation)} &middot; {getDeptName(employee.department)}
          </p>
          <div className="emp-detail-contact">
            <span>
              <Mail size={13} /> {employee.email}
            </span>
            {employee.phone && (
              <span>
                <Phone size={13} /> {employee.phone}
              </span>
            )}
          </div>
        </div>
        <Link to={`/employees?edit=${employee._id}`} className="btn btn-outline-primary d-flex align-items-center gap-1">
          <Pencil size={14} /> Edit
        </Link>
      </div>

      <div className="emp-detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`emp-detail-tab ${activeTab === tab ? "emp-detail-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="gh-card emp-detail-panel">
        {activeTab === "Overview" && (
          <dl className="emp-detail-kv">
            <div><dt>Employee ID</dt><dd>{employee.employeeId}</dd></div>
            <div><dt>Full Name</dt><dd>{employee.firstName} {employee.lastName}</dd></div>
            <div><dt>Department</dt><dd>{getDeptName(employee.department)}</dd></div>
            <div><dt>Designation</dt><dd>{getDesigName(employee.designation)}</dd></div>
            <div><dt>Status</dt><dd><StatusBadge status={employee.status} /></dd></div>
            <div><dt>Role</dt><dd>{employee.role}</dd></div>
            <div><dt>Attendance Records</dt><dd>{attendance.length}</dd></div>
            <div><dt>Leave Requests</dt><dd>{leaves.length}</dd></div>
          </dl>
        )}

        {activeTab === "Personal Information" && (
          <dl className="emp-detail-kv">
            <div><dt>Email</dt><dd>{employee.email}</dd></div>
            <div><dt>Phone</dt><dd>{employee.phone || "-"}</dd></div>
            <div><dt>Gender</dt><dd>{employee.gender || "-"}</dd></div>
          </dl>
        )}

        {activeTab === "Job Details" && (
          <dl className="emp-detail-kv">
            <div><dt>Employee ID</dt><dd>{employee.employeeId}</dd></div>
            <div><dt>Department</dt><dd>{getDeptName(employee.department)}</dd></div>
            <div><dt>Designation</dt><dd>{getDesigName(employee.designation)}</dd></div>
            <div><dt>Role</dt><dd>{employee.role}</dd></div>
            <div><dt>Date of Joining</dt><dd>{formatDate(employee.dateOfJoining)}</dd></div>
            <div><dt>Status</dt><dd><StatusBadge status={employee.status} /></dd></div>
          </dl>
        )}

        {activeTab === "Attendance" && (
          attendance.length === 0 ? (
            <EmptyState title="No attendance records" description="This employee has no recorded attendance yet." />
          ) : (
            <div className="table-responsive">
              <table className="table gh-table align-middle mb-0">
                <thead>
                  <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 20).map((record) => (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                      <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                      <td><StatusBadge status={record.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === "Leave History" && (
          leaves.length === 0 ? (
            <EmptyState title="No leave requests" description="This employee hasn't applied for leave yet." />
          ) : (
            <div className="table-responsive">
              <table className="table gh-table align-middle mb-0">
                <thead>
                  <tr><th>Type</th><th>From</th><th>To</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td><StatusBadge status={leave.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === "Performance" && (
          <div className="emp-detail-performance">
            <div>
              <h3>Reviews</h3>
              {reviews.length === 0 ? (
                <EmptyState title="No reviews yet" />
              ) : (
                reviews.map((review) => (
                  <div className="emp-perf-row" key={review._id}>
                    <span>{review.reviewPeriod}</span>
                    <StatusBadge status={review.status} />
                    <span>{review.rating ? `${review.rating}/5` : "-"}</span>
                  </div>
                ))
              )}
            </div>
            <div>
              <h3>Goals</h3>
              {goals.length === 0 ? (
                <EmptyState title="No goals assigned" />
              ) : (
                goals.map((goal) => (
                  <div className="emp-perf-row" key={goal._id}>
                    <span>{goal.title}</span>
                    <StatusBadge status={goal.status} />
                    <span>{goal.progress}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;
