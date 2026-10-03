import { useState } from "react";
import { getApiError } from "../../utils/apiError";
import { Link } from "react-router-dom";
import { ChevronRight, KeyRound, ShieldCheck, UserRound, Users, Wrench } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import { useToast } from "../../components/ui/useToast";
import "./Settings.css";

const adminLinks = [
  { to: "/admin", label: "Organization configuration", description: "Locations, job settings, qualifications and more", icon: Wrench },
  { to: "/admin/users", label: "User management", description: "Manage system user accounts", icon: Users },
  { to: "/admin/user-roles", label: "User roles", description: "Review the roles available in the system", icon: ShieldCheck },
];

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const newPasswordError =
    form.newPassword.length > 0 && form.newPassword.length < 6
      ? "Password must be at least 6 characters"
      : "";
  const confirmError =
    form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword
      ? "Passwords do not match"
      : "";

  const canSubmit =
    form.currentPassword && form.newPassword.length >= 6 && form.newPassword === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setSaving(true);
    try {
      const response = await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast(response.data.message || "Password updated successfully", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTouched(false);
    } catch (error) {
      showToast(getApiError(error, "Failed to update password"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gh-page">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="set-grid">
        <div className="set-column">
          <div className="gh-card set-card">
            <div className="set-card-title">
              <UserRound size={17} />
              <h2>Profile</h2>
            </div>
            <div className="set-profile">
              <div className="set-avatar">{user?.firstName?.charAt(0).toUpperCase()}</div>
              <div>
                <strong>
                  {user?.firstName} {user?.lastName}
                </strong>
                <span>{user?.email}</span>
                <span>
                  {user?.role} · {user?.employeeId}
                </span>
              </div>
            </div>
            <Link to="/my-info" className="btn btn-outline-primary btn-sm">
              Edit contact information
            </Link>
          </div>

          {isAdmin && (
            <div className="gh-card set-card">
              <div className="set-card-title">
                <Wrench size={17} />
                <h2>Administration</h2>
              </div>
              <div className="set-links">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link to={link.to} className="set-link" key={link.to}>
                      <span className="set-link-icon">
                        <Icon size={16} />
                      </span>
                      <span className="set-link-text">
                        <strong>{link.label}</strong>
                        <small>{link.description}</small>
                      </span>
                      <ChevronRight size={16} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="gh-card set-card">
          <div className="set-card-title">
            <KeyRound size={17} />
            <h2>Change password</h2>
          </div>
          <form onSubmit={handleSubmit} className="gh-form" noValidate>
            <div className="gh-form-group">
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                className={`form-control ${touched && !form.currentPassword ? "is-invalid" : ""}`}
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
              {touched && !form.currentPassword && <div className="gh-field-error">Enter your current password</div>}
            </div>
            <div className="gh-form-group">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className={`form-control ${newPasswordError ? "is-invalid" : ""}`}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
              {newPasswordError && <div className="gh-field-error">{newPasswordError}</div>}
            </div>
            <div className="gh-form-group">
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className={`form-control ${confirmError ? "is-invalid" : ""}`}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {confirmError && <div className="gh-field-error">{confirmError}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
