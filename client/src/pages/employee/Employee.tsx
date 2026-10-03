import { useEffect, useMemo, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Search, Users } from "lucide-react";

import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../services/employeeService";
import type { EmployeeData } from "../../services/employeeService";
import { getDepartments } from "../../services/departmentService";
import { getDesignations } from "../../services/designationService";
import PageHeader from "../../components/layout/PageHeader";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import Pagination from "../../components/pagination/Pagination";
import { useToast } from "../../components/ui/useToast";
import { useConfirm } from "../../components/ui/useConfirm";
import Field from "../../components/forms/Field";
import "./Employee.css";

const PAGE_SIZE = 10;

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  department: string | { _id: string };
  designation: string | { _id: string };
  phone: string;
  gender: string;
  profileImage?: string;
  status: string;
  dateOfJoining?: string;
}

interface Department {
  _id: string;
  name: string;
  status?: string;
}

interface Designation {
  _id: string;
  name: string;
  department: string | { _id: string };
  status?: string;
}

interface EmployeeForm {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  department: string;
  designation: string;
  phone: string;
  gender: string;
  profileImage: string;
  status: string;
  dateOfJoining: string;
}

const initialForm: EmployeeForm = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "Employee",
  department: "",
  designation: "",
  phone: "",
  gender: "Male",
  profileImage: "",
  status: "Active",
  dateOfJoining: "",
};

type SortKey = "name" | "department" | "status";

const Employee = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<EmployeeForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getId = (value: string | { _id: string } | undefined): string => {
    if (!value) return "";
    return typeof value === "string" ? value : String(value._id || "");
  };

  const getDepartmentName = (value: Employee["department"]) =>
    departments.find((d) => d._id === getId(value))?.name || "-";

  const getDesignationName = (value: Employee["designation"]) =>
    designations.find((d) => d._id === getId(value))?.name || "-";

  const refreshEmployees = async () => {
    const response = await getEmployees();
    if (response.success) setEmployees(response.data || []);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [empRes, deptRes, desigRes] = await Promise.all([
          getEmployees(),
          getDepartments(),
          getDesignations(),
        ]);
        if (!mounted) return;
        if (empRes.success) setEmployees(empRes.data || []);
        if (deptRes.success) setDepartments(deptRes.data || []);
        if (desigRes.success) setDesignations(desigRes.data || []);
      } catch (error) {
        console.error(error);
        showToast("Failed to load employees", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableDesignations = useMemo(
    () => designations.filter((d) => getId(d.department) === formData.department),
    [designations, formData.department]
  );

  const filteredEmployees = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    const result = employees.filter((employee) => {
      const departmentName = getDepartmentName(employee.department);
      const designationName = getDesignationName(employee.designation);
      const fullName = `${employee.firstName} ${employee.lastName}`;

      const matchesSearch =
        !searchText ||
        employee.employeeId?.toLowerCase().includes(searchText) ||
        fullName.toLowerCase().includes(searchText) ||
        employee.email?.toLowerCase().includes(searchText) ||
        departmentName.toLowerCase().includes(searchText) ||
        designationName.toLowerCase().includes(searchText);

      const matchesDepartment =
        !departmentFilter || getId(employee.department) === departmentFilter;

      const matchesStatus = !statusFilter || employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });

    const sortValue = (employee: Employee) =>
      sort.key === "name"
        ? `${employee.firstName} ${employee.lastName}`
        : sort.key === "department"
          ? getDepartmentName(employee.department)
          : employee.status;

    const sorted = [...result].sort((a, b) => {
      const comparison = sortValue(a).localeCompare(sortValue(b));
      return sort.dir === "asc" ? comparison : -comparison;
    });

    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, search, departmentFilter, statusFilter, sort, departments, designations]);

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const renderSortIcon = (column: SortKey) => {
    if (sort.key !== column) return <ArrowUpDown size={12} className="emp-sort-icon" />;
    return sort.dir === "asc" ? (
      <ArrowUp size={12} className="emp-sort-icon emp-sort-icon-active" />
    ) : (
      <ArrowDown size={12} className="emp-sort-icon emp-sort-icon-active" />
    );
  };

  const handleAddEmployee = () => {
    setEditingId(null);
    setFormData({ ...initialForm, dateOfJoining: new Date().toISOString().split("T")[0] });
    setShowForm(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await getEmployeeById(id);
      if (!response.success) {
        showToast(response.message || "Failed to load employee", "error");
        return;
      }

      const employee = response.data;
      setEditingId(id);
      setFormData({
        employeeId: employee.employeeId || "",
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        password: "",
        role: employee.role || "Employee",
        department: getId(employee.department),
        designation: getId(employee.designation),
        phone: employee.phone || "",
        gender: employee.gender || "Male",
        profileImage: employee.profileImage || "",
        status: employee.status || "Active",
        dateOfJoining: employee.dateOfJoining
          ? new Date(employee.dateOfJoining).toISOString().split("T")[0]
          : "",
      });
      setShowForm(true);
    } catch (error) {
      console.error(error);
      showToast("Failed to load employee", "error");
    }
  };

  // Deep-link support: ?edit=<id> opens the edit modal for that employee
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && employees.length > 0) {
      handleEdit(editId);
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast("First name and last name are required", "error");
      return;
    }
    if (!formData.email.trim()) {
      showToast("Email is required", "error");
      return;
    }
    if (!formData.department) {
      showToast("Please select a department", "error");
      return;
    }
    if (!formData.designation) {
      showToast("Please select a designation", "error");
      return;
    }
    if (!editingId && !formData.password) {
      showToast("Password is required", "error");
      return;
    }

    try {
      setSubmitting(true);

      const employeeData: EmployeeData = {
        employeeId: formData.employeeId || undefined,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
        gender: formData.gender,
        profileImage: formData.profileImage,
        status: formData.status,
        dateOfJoining: formData.dateOfJoining,
      };

      if (formData.password.trim()) {
        employeeData.password = formData.password;
      }

      const response = editingId
        ? await updateEmployee(editingId, employeeData)
        : await createEmployee(employeeData);

      if (response.success) {
        showToast(`Employee ${editingId ? "updated" : "created"} successfully`, "success");
        await refreshEmployees();
        handleCancel();
      } else {
        showToast(response.message || "Failed to save employee", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to save employee"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = await confirm({
      title: "Delete employee",
      message: `Delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      const response = await deleteEmployee(employee._id);
      if (response.success) {
        showToast("Employee deleted successfully", "success");
        await refreshEmployees();
      } else {
        showToast(response.message || "Failed to delete employee", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to delete employee"), "error");
    }
  };

  return (
    <div className="gh-page">
      <PageHeader
        title="Employees"
        description={`${employees.length} employee${employees.length === 1 ? "" : "s"} in your organization`}
        actions={
          <button className="btn btn-primary d-flex align-items-center gap-1" onClick={handleAddEmployee}>
            <Plus size={16} /> Add Employee
          </button>
        }
      />

      {/* FILTER TOOLBAR */}
      <div className="gh-card emp-toolbar">
        <div className="emp-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="form-select emp-filter-select"
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          className="form-select emp-filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="gh-card emp-table-card">
        {loading ? (
          <div style={{ padding: 20 }}>
            <SkeletonRows rows={6} />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No employees found"
            description={search || departmentFilter || statusFilter ? "Try adjusting your filters." : "Add your first employee to get started."}
          />
        ) : (
          <div className="table-responsive">
            <table className="table gh-table align-middle mb-0">
              <thead>
                <tr>
                  <th className="emp-sortable" onClick={() => toggleSort("name")}>
                    Employee {renderSortIcon("name")}
                  </th>
                  <th>Employee ID</th>
                  <th className="emp-sortable" onClick={() => toggleSort("department")}>
                    Department {renderSortIcon("department")}
                  </th>
                  <th>Designation</th>
                  <th className="emp-sortable" onClick={() => toggleSort("status")}>
                    Status {renderSortIcon("status")}
                  </th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="emp-row"
                    onClick={() => navigate(`/employees/${employee._id}`)}
                  >
                    <td>
                      <div className="emp-name-cell">
                        <div className="emp-avatar">{employee.firstName.charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>
                            {employee.firstName} {employee.lastName}
                          </strong>
                          <div className="emp-email">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{employee.employeeId}</td>
                    <td>{getDepartmentName(employee.department)}</td>
                    <td>{getDesignationName(employee.designation)}</td>
                    <td>
                      <StatusBadge status={employee.status} />
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(employee._id)}
                      >
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(employee)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={filteredEmployees.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        open={showForm}
        onClose={handleCancel}
        title={editingId ? "Edit Employee" : "Add Employee"}
        subtitle={editingId ? "Update employee information" : "Enter employee information"}
        width={620}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" form="employee-form" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Employee" : "Create Employee"}
            </button>
          </>
        }
      >
        <form id="employee-form" onSubmit={handleSubmit} className="gh-form">
          <div className="gh-form-grid">
            <Field label="Employee ID">
<input className="form-control" value={formData.employeeId} placeholder="Auto generated" disabled />
</Field>
            <Field label="Role">
<select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
</Field>
            <Field label="First Name *">
<input
                required
                className="form-control"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
</Field>
            <Field label="Last Name *">
<input
                required
                className="form-control"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
</Field>
            <Field label="Email *">
<input
                required
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
</Field>
            {!editingId && (
              <Field label="Password *">
<input
                  required
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
</Field>
            )}
            <Field label="Department *">
<select
                required
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value, designation: "" })}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
</Field>
            <Field label="Designation *">
<select
                required
                className="form-select"
                disabled={!formData.department}
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              >
                <option value="">
                  {!formData.department
                    ? "Select department first"
                    : availableDesignations.length === 0
                      ? "No designations available"
                      : "Select Designation"}
                </option>
                {availableDesignations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
</Field>
            <Field label="Phone">
<input
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
</Field>
            <Field label="Gender">
<select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
</Field>
            <Field label="Status">
<select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
</Field>
            <Field label="Date of Joining">
<input
                type="date"
                className="form-control"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              />
</Field>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employee;
