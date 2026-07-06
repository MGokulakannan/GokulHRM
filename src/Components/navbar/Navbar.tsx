import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg px-4"
      style={{
        backgroundColor: "#ff7900",
        height: "60px",
      }}
    >
      <div className="container-fluid">

        {/* Page Name */}
        <h5 className="text-white mb-0">Dashboard</h5>

        {/* Right Side */}
        <div className="ms-auto d-flex align-items-center">

          {/* Upgrade Button */}
          <button className="btn btn-light rounded-pill me-3">
            <i className="bi bi-arrow-up-circle me-2"></i>
            Upgrade
          </button>

          {/* Notification */}
          <button className="btn text-white me-3">
            <i className="bi bi-bell-fill fs-5"></i>
          </button>

          {/* Message */}
          <button className="btn text-white me-3">
            <i className="bi bi-chat-dots-fill fs-5"></i>
          </button>

          {/* User Dropdown */}
          <div className="dropdown">

            <button
              className="btn btn-warning dropdown-toggle text-white"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-circle me-2"></i>
              Admin
            </button>

            <ul className="dropdown-menu dropdown-menu-end">

              <li>
                <Link className="dropdown-item" to="/profile">
                  <i className="bi bi-person me-2"></i>
                  My Profile
                </Link>
              </li>

              <li>
                <Link className="dropdown-item" to="/settings">
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </Link>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <Link className="dropdown-item text-danger" to="/">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Link>
              </li>

            </ul>

          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;