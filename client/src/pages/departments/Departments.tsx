import { useEffect, useMemo, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { Building2, Plus, Search } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/useToast";
import { useConfirm } from "../../components/ui/useConfirm";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../../services/departmentService";
import type { Department } from "../../services/departmentService";
import { getEmployees } from "../../services/employeeService";
import Field from "../../components/forms/Field";
import "./Departments.css";

const initialForm = { name: "", description: "", status: "Active" };

const Departments = () => {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([getDepartments(), getEmployees()]);

      if (deptRes.success) setDepartments(deptRes.data || []);

      if (empRes.success) {
        const counts: Record<string, number> = {};
        (empRes.data || []).forEach((employee: { department?: string | { _id: string } }) => {
          const deptId =
            typeof employee.department === "object"
              ? employee.department?._id
              : employee.department;
          if (deptId) counts[deptId] = (counts[deptId] || 0) + 1;
        });
        setEmployeeCounts(counts);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load departments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      departments.filter((dept) =>
        `${dept.name} ${dept.description || ""}`.toLowerCase().includes(search.toLowerCase())
      ),
    [departments, search]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setEditingId(dept._id);
    setForm({ name: dept.name, description: dept.description || "", status: dept.status });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = editingId
        ? await updateDepartment(editingId, form)
        : await createDepartment(form);

      if (response.success) {
        showToast(`Department ${editingId ? "updated" : "created"} successfully`, "success");
        setShowModal(false);
        await loadAll();
      } else {
        showToast(response.message || "Failed to save department", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to save department"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    const confirmed = await confirm({
      title: "Delete department",
      message: `Delete "${dept.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      const response = await deleteDepartment(dept._id);
      if (response.success) {
        showToast("Department deleted", "success");
        await loadAll();
      } else {
        showToast(response.message || "Failed to delete department", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to delete department"), "error");
    }
  };

  return (
    <div className="gh-page">
      <PageHeader
        title="Departments"
        description="Organize your company into departments"
        actions={
          <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openAdd}>
            <Plus size={16} /> Add Department
          </button>
        }
      />

      <div className="gh-card dept-toolbar">
        <div className="dept-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="gh-card dept-table-card">
        {loading ? (
          <div style={{ padding: 20 }}>
            <SkeletonRows rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 size={20} />}
            title="No departments found"
            description={search ? "Try a different search term." : "Create your first department to get started."}
          />
        ) : (
          <div className="table-responsive">
            <table className="table gh-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Employees</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept) => (
                  <tr key={dept._id}>
                    <td>
                      <div className="dept-name-cell">
                        <span className="dept-icon">
                          <Building2 size={16} />
                        </span>
                        <strong>{dept.name}</strong>
                      </div>
                    </td>
                    <td className="text-muted gh-wrap">{dept.description || "-"}</td>
                    <td>{employeeCounts[dept._id] || 0}</td>
                    <td>
                      <StatusBadge status={dept.status} />
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(dept)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(dept)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Department" : "Add Department"}
        footer={
          <>
            <button className="btn btn-outline-primary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" form="department-form" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Department"}
            </button>
          </>
        }
      >
        <form id="department-form" onSubmit={handleSubmit} className="gh-form">
          <Field label="Name *">
<input
              required
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
</Field>
          <Field label="Description">
<textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
</Field>
          <Field label="Status">
<select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
</Field>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
