import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-header">
        <div>
          <h1>Admin</h1>
          <p>Manage system configuration and users</p>
        </div>
      </div>

      {/* ADMIN MODULES */}
      <div className="admin-section-grid">

        {/* USER MANAGEMENT */}
        <div className="admin-section-card">
          <h2>User Management</h2>

          <button onClick={() => navigate("/admin/users")}>
            Users
          </button>

          <button onClick={() => navigate("/admin/user-roles")}>
            User Roles
          </button>
        </div>

        {/* JOB */}
        <div className="admin-section-card">
          <h2>Job</h2>

          <button onClick={() => navigate("/admin/job-titles")}>
            Job Titles
          </button>

          <button onClick={() => navigate("/admin/pay-grades")}>
            Pay Grades
          </button>

          <button onClick={() => navigate("/admin/employment-status")}>
            Employment Status
          </button>

          <button onClick={() => navigate("/admin/job-categories")}>
            Job Categories
          </button>

          <button onClick={() => navigate("/admin/work-shifts")}>
            Work Shifts
          </button>
        </div>

        {/* ORGANIZATION */}
        <div className="admin-section-card">
          <h2>Organization</h2>

          <button onClick={() => navigate("/admin/general-information")}>
            General Information
          </button>

          <button onClick={() => navigate("/admin/locations")}>
            Locations
          </button>

          <button onClick={() => navigate("/admin/structure")}>
            Structure
          </button>

          <button onClick={() => navigate("/admin/cost-centers")}>
            Cost Centers
          </button>
        </div>

        {/* QUALIFICATIONS */}
        <div className="admin-section-card">
          <h2>Qualifications</h2>

          <button onClick={() => navigate("/admin/skills")}>
            Skills
          </button>

          <button onClick={() => navigate("/admin/education")}>
            Education
          </button>

          <button onClick={() => navigate("/admin/licenses")}>
            Licenses
          </button>

          <button onClick={() => navigate("/admin/languages")}>
            Languages
          </button>

          <button onClick={() => navigate("/admin/memberships")}>
            Memberships
          </button>
        </div>

        {/* NATIONALITIES */}
        <div className="admin-section-card">
          <h2>Nationalities</h2>

          <button onClick={() => navigate("/admin/nationalities")}>
            Manage Nationalities
          </button>
        </div>

        {/* CONFIGURATION */}
        <div className="admin-section-card">
          <h2>Configuration</h2>

          <button onClick={() => navigate("/admin/email-notifications")}>
            Email Notifications
          </button>

          <button onClick={() => navigate("/admin/localization")}>
            Localization
          </button>

          <button onClick={() => navigate("/admin/modules")}>
            Modules
          </button>
        </div>

      </div>
    </div>
  );
};

export default Admin;