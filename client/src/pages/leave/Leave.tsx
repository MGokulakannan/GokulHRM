import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { CalendarDays, Plus, Search, Settings2 } from "lucide-react";

import { useAuth } from "../../context/useAuth";
import {
  createLeave,
  deleteLeave,
  getLeaves,
  updateLeave,
} from "../../services/leaveService";
import {
  createLeaveType,
  deleteLeaveType,
  getLeaveTypes,
} from "../../services/leaveTypeService";
import type { LeaveType } from "../../services/leaveTypeService";
import { getEmployees } from "../../services/employeeService";
import PageHeader from "../../components/layout/PageHeader";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import Pagination from "../../components/pagination/Pagination";
import { useToast } from "../../components/ui/useToast";
import { useConfirm } from "../../components/ui/useConfirm";
import Field from "../../components/forms/Field";
import "./Leave.css";

const PAGE_SIZE = 10;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_LEAVE_TYPES = [
  "Annual Leave",
  "Casual Leave",
  "Sick Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Other",
];

interface EmployeeRef {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface LeaveRecord {
  _id: string;
  employee?: EmployeeRef | string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: string;
}

interface EmployeeOption {
  _id: string;
  firstName?: string;
  lastName?: string;
}

const emptyForm = {
  employee: "",
  leaveType: "",
  startDate: "",
  endDate: "",
  reason: "",
  status: "Pending",
};

const getOwnerId = (leave: LeaveRecord) =>
  typeof leave.employee === "object" && leave.employee ? leave.employee._id : leave.employee;

const getEmployeeName = (employee?: EmployeeRef | string) =>
  typeof employee === "object" && employee
    ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "-"
    : "-";

const getDuration = (leave: LeaveRecord) => {
  const diff = new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime();
  if (Number.isNaN(diff)) return 0;
  return Math.floor(diff / MS_PER_DAY) + 1;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"] as const;

const Leave = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRecord | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [detailLeave, setDetailLeave] = useState<LeaveRecord | null>(null);

  const [showTypeManager, setShowTypeManager] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDays, setNewTypeDays] = useState(12);

  const activeTypeNames = useMemo(() => {
    const active = leaveTypes.filter((type) => type.status === "Active").map((type) => type.name);
    return active.length > 0 ? active : DEFAULT_LEAVE_TYPES;
  }, [leaveTypes]);

  const fetchAll = useCallback(async () => {
    try {
      const [leaveRes, typeRes, employeeRes] = await Promise.all([
        getLeaves(),
        getLeaveTypes(),
        isAdmin ? getEmployees() : Promise.resolve(null),
      ]);
      if (leaveRes?.success) setLeaves(leaveRes.data || []);
      if (typeRes?.success) setLeaveTypes(typeRes.data || []);
      if (employeeRes?.success) setEmployees(employeeRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load leave data", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const canModify = (leave: LeaveRecord) =>
    isAdmin || (getOwnerId(leave) === user?._id && leave.status === "Pending");

  // Leave balance: allowance vs approved days this year for the signed-in user
  const balances = useMemo(() => {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
    return leaveTypes
      .filter((type) => type.status === "Active")
      .map((type) => {
        const used = leaves
          .filter(
            (leave) =>
              getOwnerId(leave) === user?._id &&
              leave.leaveType === type.name &&
              leave.status === "Approved" &&
              new Date(leave.startDate).getTime() >= yearStart
          )
          .reduce((total, leave) => total + getDuration(leave), 0);
        return { name: type.name, allowance: type.daysPerYear, used };
      });
  }, [leaveTypes, leaves, user?._id]);

  const counts = useMemo(
    () => ({
      All: leaves.length,
      Pending: leaves.filter((l) => l.status === "Pending").length,
      Approved: leaves.filter((l) => l.status === "Approved").length,
      Rejected: leaves.filter((l) => l.status === "Rejected").length,
    }),
    [leaves]
  );

  const filtered = useMemo(() => {
    const text = search.toLowerCase().trim();
    return leaves.filter((leave) => {
      const matchesStatus = statusTab === "All" || leave.status === statusTab;
      const haystack = `${getEmployeeName(leave.employee)} ${leave.leaveType} ${leave.reason || ""}`.toLowerCase();
      return matchesStatus && (!text || haystack.includes(text));
    });
  }, [leaves, search, statusTab]);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openApply = () => {
    setEditingLeave(null);
    setFormData({
      ...emptyForm,
      employee: isAdmin ? "" : user?._id || "",
      leaveType: activeTypeNames[0] || "",
    });
    setShowForm(true);
  };

  const openEdit = (leave: LeaveRecord) => {
    setDetailLeave(null);
    setEditingLeave(leave);
    setFormData({
      employee: (getOwnerId(leave) as string) || "",
      leaveType: leave.leaveType,
      startDate: leave.startDate.substring(0, 10),
      endDate: leave.endDate.substring(0, 10),
      reason: leave.reason || "",
      status: leave.status,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLeave(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employee) {
      showToast("Please select an employee", "error");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      showToast("Please select start and end dates", "error");
      return;
    }
    if (formData.endDate < formData.startDate) {
      showToast("End date cannot be before start date", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee: formData.employee,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: formData.status as "Pending" | "Approved" | "Rejected",
      };

      const response = editingLeave
        ? await updateLeave(editingLeave._id, payload)
        : await createLeave(payload);

      if (response?.success) {
        showToast(editingLeave ? "Leave request updated" : "Leave request submitted", "success");
        closeForm();
        await fetchAll();
      } else {
        showToast(response?.message || "Failed to save leave request", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to save leave request"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (leave: LeaveRecord, status: "Approved" | "Rejected") => {
    const confirmed = await confirm({
      title: `${status === "Approved" ? "Approve" : "Reject"} leave request`,
      message: `${status === "Approved" ? "Approve" : "Reject"} ${leave.leaveType} for ${getEmployeeName(leave.employee)} (${formatDate(leave.startDate)} - ${formatDate(leave.endDate)})?`,
      confirmLabel: status === "Approved" ? "Approve" : "Reject",
      tone: status === "Approved" ? "primary" : "danger",
    });
    if (!confirmed) return;

    try {
      const response = await updateLeave(leave._id, { status });
      if (response?.success) {
        showToast(`Leave request ${status.toLowerCase()}`, "success");
        setDetailLeave(null);
        await fetchAll();
      } else {
        showToast(response?.message || `Failed to ${status.toLowerCase()} leave`, "error");
      }
    } catch (error) {
      showToast(getApiError(error, `Failed to ${status.toLowerCase()} leave`), "error");
    }
  };

  const handleDelete = async (leave: LeaveRecord) => {
    const confirmed = await confirm({
      title: isAdmin ? "Delete leave request" : "Cancel leave request",
      message: "This cannot be undone.",
      confirmLabel: isAdmin ? "Delete" : "Cancel request",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      const response = await deleteLeave(leave._id);
      if (response?.success) {
        showToast("Leave request removed", "success");
        setDetailLeave(null);
        await fetchAll();
      } else {
        showToast(response?.message || "Failed to remove leave request", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to remove leave request"), "error");
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    try {
      const response = await createLeaveType({ name: newTypeName.trim(), daysPerYear: newTypeDays });
      if (response?.success) {
        showToast("Leave type added", "success");
        setNewTypeName("");
        setNewTypeDays(12);
        await fetchAll();
      } else {
        showToast(response?.message || "Failed to add leave type", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to add leave type"), "error");
    }
  };

  const handleDeleteType = async (type: LeaveType) => {
    const confirmed = await confirm({
      title: "Delete leave type",
      message: `Delete "${type.name}"? Existing requests keep their type name.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteLeaveType(type._id);
      showToast("Leave type deleted", "success");
      await fetchAll();
    } catch {
      showToast("Failed to delete leave type", "error");
    }
  };

  return (
    <div className="gh-page">
      <PageHeader
        title="Leave Management"
        description={isAdmin ? "Review and manage leave requests across the organization" : "Apply for leave and track your requests"}
        actions={
          <>
            {isAdmin && (
              <button className="btn btn-outline-primary d-flex align-items-center gap-1" onClick={() => setShowTypeManager(true)}>
                <Settings2 size={15} /> Leave Types
              </button>
            )}
            <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openApply}>
              <Plus size={16} /> Apply Leave
            </button>
          </>
        }
      />

      {/* BALANCE CARDS */}
      {balances.length > 0 && (
        <div className="leave-balance-grid">
          {balances.map((balance) => {
            const remaining = Math.max(balance.allowance - balance.used, 0);
            const percent = balance.allowance > 0 ? Math.min((balance.used / balance.allowance) * 100, 100) : 0;
            return (
              <div className="gh-card leave-balance-card" key={balance.name}>
                <div className="leave-balance-top">
                  <span>{balance.name}</span>
                  <strong>
                    {remaining}
                    <small> / {balance.allowance} left</small>
                  </strong>
                </div>
                <div className="leave-balance-track">
                  <div className="leave-balance-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FILTERS */}
      <div className="gh-card leave-toolbar">
        <div className="leave-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              className={`leave-tab ${statusTab === tab ? "leave-tab-active" : ""}`}
              onClick={() => {
                setStatusTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab} <span>{counts[tab]}</span>
            </button>
          ))}
        </div>
        <div className="leave-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="gh-card leave-table-card">
        {loading ? (
          <div style={{ padding: 20 }}>
            <SkeletonRows rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={20} />}
            title="No leave requests"
            description={search || statusTab !== "All" ? "Try adjusting your filters." : "Leave requests will appear here once submitted."}
          />
        ) : (
          <div className="table-responsive">
            <table className="table gh-table align-middle mb-0">
              <thead>
                <tr>
                  {isAdmin && <th>Employee</th>}
                  <th>Leave Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Days</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((leave) => (
                  <tr key={leave._id} className="leave-row" onClick={() => setDetailLeave(leave)}>
                    {isAdmin && (
                      <td>
                        <div className="leave-employee-cell">
                          <span className="leave-avatar">
                            {getEmployeeName(leave.employee).charAt(0).toUpperCase()}
                          </span>
                          {getEmployeeName(leave.employee)}
                        </div>
                      </td>
                    )}
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDate)}</td>
                    <td>{formatDate(leave.endDate)}</td>
                    <td>{getDuration(leave)}</td>
                    <td className="text-muted">{formatDate(leave.createdAt)}</td>
                    <td>
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && leave.status === "Pending" && (
                        <>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleDecision(leave, "Approved")}>
                            Approve
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDecision(leave, "Rejected")}>
                            Reject
                          </button>
                        </>
                      )}
                      {!isAdmin && canModify(leave) && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(leave)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* APPLY / EDIT MODAL */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editingLeave ? "Edit Leave Request" : "Apply for Leave"}
        subtitle={editingLeave ? "Update the request details" : "Submit a new leave request"}
        width={560}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="leave-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingLeave ? "Update Request" : "Submit Request"}
            </button>
          </>
        }
      >
        <form id="leave-form" onSubmit={handleSubmit} className="gh-form">
          <div className="gh-form-grid">
            {isAdmin ? (
              <Field label="Employee *" className="gh-form-grid-full">
<select
                  required
                  className="form-select"
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
</Field>
            ) : null}
            <Field label="Leave Type *" className={isAdmin ? "" : "gh-form-grid-full"}>
<select
                className="form-select"
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              >
                {activeTypeNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
</Field>
            {isAdmin && (
              <Field label="Status">
<select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
</Field>
            )}
            <Field label="Start Date *">
<input
                required
                type="date"
                className="form-control"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
</Field>
            <Field label="End Date *">
<input
                required
                type="date"
                className="form-control"
                min={formData.startDate}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
</Field>
            <Field label="Reason" className="gh-form-grid-full">
<textarea
                className="form-control"
                rows={3}
                placeholder="Optional - add context for the approver"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
</Field>
          </div>
        </form>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal
        open={Boolean(detailLeave)}
        onClose={() => setDetailLeave(null)}
        title="Leave Request"
        subtitle={detailLeave ? `${detailLeave.leaveType} · ${getDuration(detailLeave)} day(s)` : ""}
        footer={
          detailLeave && (
            <>
              {canModify(detailLeave) && (
                <>
                  <button className="btn btn-outline-danger" onClick={() => handleDelete(detailLeave)}>
                    {isAdmin ? "Delete" : "Cancel Request"}
                  </button>
                  <button className="btn btn-outline-primary" onClick={() => openEdit(detailLeave)}>
                    Edit
                  </button>
                </>
              )}
              {isAdmin && detailLeave.status === "Pending" && (
                <>
                  <button className="btn btn-outline-danger" onClick={() => handleDecision(detailLeave, "Rejected")}>
                    Reject
                  </button>
                  <button className="btn btn-primary" onClick={() => handleDecision(detailLeave, "Approved")}>
                    Approve
                  </button>
                </>
              )}
            </>
          )
        }
      >
        {detailLeave && (
          <dl className="leave-detail-list">
            <div>
              <dt>Employee</dt>
              <dd>{getEmployeeName(detailLeave.employee)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={detailLeave.status} />
              </dd>
            </div>
            <div>
              <dt>Start</dt>
              <dd>{formatDate(detailLeave.startDate)}</dd>
            </div>
            <div>
              <dt>End</dt>
              <dd>{formatDate(detailLeave.endDate)}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{formatDate(detailLeave.createdAt)}</dd>
            </div>
            <div className="leave-detail-full">
              <dt>Reason</dt>
              <dd>{detailLeave.reason || "No reason provided"}</dd>
            </div>
          </dl>
        )}
      </Modal>

      {/* LEAVE TYPES MODAL (Admin) */}
      <Modal
        open={showTypeManager}
        onClose={() => setShowTypeManager(false)}
        title="Leave Types"
        subtitle="Types employees can apply for, with yearly allowances"
      >
        <form className="leave-type-add" onSubmit={handleCreateType}>
          <input
            className="form-control"
            placeholder="Type name"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
          <input
            className="form-control leave-type-days"
            type="number"
            min={0}
            value={newTypeDays}
            onChange={(e) => setNewTypeDays(Number(e.target.value))}
            aria-label="Days per year"
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>

        {leaveTypes.length === 0 ? (
          <p className="leave-type-empty">No custom leave types yet - the defaults are in use.</p>
        ) : (
          <ul className="leave-type-list">
            {leaveTypes.map((type) => (
              <li key={type._id}>
                <span>{type.name}</span>
                <span className="text-muted">{type.daysPerYear} days/year</span>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteType(type)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};

export default Leave;
