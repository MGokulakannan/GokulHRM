import { useEffect, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { useAuth } from "../../context/useAuth";
import { getDepartments } from "../../services/departmentService";
import { getDesignations } from "../../services/designationService";
import api from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { useToast } from "../../components/ui/useToast";
import "./MyInfo.css";

interface LookupItem {
  _id: string;
  name: string;
}

const MyInfo = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [designations, setDesignations] = useState<LookupItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: user?.phone || "",
    gender: user?.gender || "Male",
  });

  useEffect(() => {
    Promise.all([getDepartments(), getDesignations()])
      .then(([departmentsRes, designationsRes]) => {
        if (departmentsRes.success) setDepartments(departmentsRes.data || []);
        if (designationsRes.success) setDesignations(designationsRes.data || []);
      })
      .catch((error) => console.error("Failed to load lookup data:", error));
  }, []);

  const getName = (items: LookupItem[], id?: string) =>
    items.find((item) => item._id === id)?.name || "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/auth/me", form);
      await refreshUser();
      showToast("Profile updated successfully", "success");
    } catch (error) {
      showToast(getApiError(error, "Failed to update profile"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const details: [string, React.ReactNode][] = [
    ["Employee ID", user.employeeId],
    ["Full name", `${user.firstName} ${user.lastName}`],
    ["Email", user.email],
    ["Role", user.role],
    ["Department", getName(departments, user.department)],
    ["Designation", getName(designations, user.designation)],
    [
      "Date of joining",
      user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-",
    ],
    ["Status", user.status ? <StatusBadge status={user.status} /> : "-"],
  ];

  return (
    <div className="gh-page">
      <PageHeader title="My Profile" description="View and manage your personal information" />

      <div className="my-info-grid">
        <div className="gh-card my-info-card">
          <h2>Employment details</h2>
          <dl className="my-info-list">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="my-info-hint">
            Contact an administrator to change your department, designation or email.
          </p>
        </div>

        <div className="gh-card my-info-card">
          <h2>Contact information</h2>
          <form onSubmit={handleSubmit} className="gh-form">
            <div className="gh-form-group">
              <label htmlFor="profile-phone">Phone</label>
              <input
                id="profile-phone"
                type="tel"
                className="form-control"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="gh-form-group">
              <label htmlFor="profile-gender">Gender</label>
              <select
                id="profile-gender"
                className="form-select"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
