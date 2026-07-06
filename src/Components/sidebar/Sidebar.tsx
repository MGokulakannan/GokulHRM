import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      className="bg-white border-end shadow-sm position-fixed top-0 start-0 vh-100"
      style={{ width: "240px", zIndex: 1000 }}
    >
      <div className="border-bottom py-4 text-center">
        <h2 className="fw-bold text-warning">Gokul HRM</h2>
      </div>

      <ul className="nav flex-column mt-3">

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/dashboard">
            Dashboard
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/admin">
            Admin
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/pim">
            PIM
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/leave">
            Leave
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/time">
            Time
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/recruitment">
            Recruitment
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/performance">
            Performance
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/directory">
            Directory
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-dark px-4 py-2" to="/maintenance">
            Maintenance
          </Link>
        </li>

        <li className="nav-item mt-4">
          <Link className="nav-link text-danger px-4 py-2" to="/">
            Logout
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;