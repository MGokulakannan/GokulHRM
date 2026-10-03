import { useEffect, useMemo, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { IdCard, Plus, Search } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/useToast";
import { useConfirm } from "../../components/ui/useConfirm";
import {
  createDesignation,
  deleteDesignation,
  getDesignations,
  updateDesignation,
} from "../../services/designationService";
import type { Designation } from "../../services/designationService";
import { getDepartments } from "../../services/departmentService";
import type { Department } from "../../services/departmentService";
import Field from "../../components/forms/Field";
import "../departments/Departments.css";

const initialForm = { name: "", department: "", description: "", status: "Active" };

const getDeptLabel = (value: Designation["department"]) =>
  typeof value === "object" && value ? value.name : "-";

const Designations = () => {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [desigRes, deptRes] = await Promise.all([getDesignations(), getDepartments()]);
      if (desigRes.success) setDesignations(desigRes.data || []);
      if (deptRes.success) setDepartments(deptRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load designations", "error");
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
      designations.filter((item) =>
        `${item.name} ${getDeptLabel(item.department)}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [designations, search]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (item: Designation) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      department:
        typeof item.department === "object" ? item.department._id : item.department,
      description: item.description || "",
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = editingId
        ? await updateDesignation(editingId, form)
        : await createDesignation(form);

      if (response.success) {
        showToast(`Designation ${editingId ? "updated" : "created"} successfully`, "success");
        setShowModal(false);
        await loadAll();
      } else {
        showToast(response.message || "Failed to save designation", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to save designation"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Designation) => {
    const confirmed = await confirm({
      title: "Delete designation",
      message: `Delete "${item.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      const response = await deleteDesignation(item._id);
      if (response.success) {
        showToast("Designation deleted", "success");
        await loadAll();
      } else {
        showToast(response.message || "Failed to delete designation", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to delete designation"), "error");
    }
  };

  return (
    <div className="gh-page">
      <PageHeader
        title="Designations"
        description="Manage job designations within each department"
        actions={
          <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openAdd}>
            <Plus size={16} /> Add Designation
          </button>
        }
      />

      <div className="gh-card dept-toolbar">
        <div className="dept-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search designations..."
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
            icon={<IdCard size={20} />}
            title="No designations found"
            description={search ? "Try a different search term." : "Create your first designation to get started."}
          />
        ) : (
          <div className="table-responsive">
            <table className="table gh-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="dept-name-cell">
                        <span className="dept-icon">
                          <IdCard size={16} />
                        </span>
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>{getDeptLabel(item.department)}</td>
                    <td className="text-muted gh-wrap">{item.description || "-"}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)}>
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
        title={editingId ? "Edit Designation" : "Add Designation"}
        footer={
          <>
            <button className="btn btn-outline-primary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" form="designation-form" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Designation"}
            </button>
          </>
        }
      >
        <form id="designation-form" onSubmit={handleSubmit} className="gh-form">
          <Field label="Name *">
<input
              required
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
</Field>
          <Field label="Department *">
<select
              required
              className="form-select"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
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

export default Designations;
