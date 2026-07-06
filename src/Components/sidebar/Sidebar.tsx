import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      className="bg-white border-end shadow-sm"
      style={{
        width: "250px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {/* Logo */}
      <div className="text-center py-4 border-bottom">
        <h3 className="text-warning fw-bold">Gokul HRM</h3>
      </div>

      {/* Menu */}
      <ul className="nav flex-column mt-3">

        <li className="nav-item">
          <Link to="/dashboard" className="nav-link text-dark">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
        </li>

       <Link to="/admin" className="nav-link sidebar-link">
    <i className="bi bi-person-gear me-2"></i>
    Admin
</Link>

        <li className="nav-item">
          <Link to="/pim" className="nav-link text-dark">
            <i className="bi bi-people me-2"></i>
            PIM
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/leave" className="nav-link text-dark">
            <i className="bi bi-calendar-check me-2"></i>
            Leave
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/time" className="nav-link text-dark">
            <i className="bi bi-clock me-2"></i>
            Time
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/recruitment" className="nav-link text-dark">
            <i className="bi bi-person-plus me-2"></i>
            Recruitment
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/performance" className="nav-link text-dark">
            <i className="bi bi-graph-up-arrow me-2"></i>
            Performance
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/directory" className="nav-link text-dark">
            <i className="bi bi-book me-2"></i>
            Directory
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/maintenance" className="nav-link text-dark">
            <i className="bi bi-tools me-2"></i>
            Maintenance
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/" className="nav-link text-danger">
            <i className="bi bi-box-arrow-left me-2"></i>
            Logout
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;