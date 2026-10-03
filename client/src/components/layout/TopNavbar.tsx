import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  getMyNotifications,
  markAllNotificationsRead,
} from "../../services/notificationService";
import type { NotificationRecord } from "../../services/notificationService";
import "./TopNavbar.css";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  departments: "Departments",
  designations: "Designations",
  attendance: "Attendance",
  leave: "Leave Management",
  recruitment: "Recruitment",
  performance: "Performance",
  reports: "Reports",
  settings: "Settings",
  "my-info": "My Profile",
  admin: "Organization",
  users: "User Management",
  "user-roles": "User Roles",
  "job-titles": "Job Titles",
  "pay-grades": "Pay Grades",
  "employment-status": "Employment Status",
};

const buildBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard", path: "/dashboard" }];

  const isObjectId = (value: string) => /^[a-f0-9]{24}$/i.test(value);

  let accumulated = "";
  return segments.map((segment) => {
    accumulated += `/${segment}`;
    return {
      label: isObjectId(segment) ? "Details" : routeLabels[segment] || segment,
      path: accumulated,
    };
  });
};

const formatRelativeDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
}

const TopNavbar = ({ onOpenMobileMenu }: TopNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const crumbs = buildBreadcrumbs(location.pathname);

  // Close open dropdowns when the route changes (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setProfileOpen(false);
    setNotificationsOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        const response = await getMyNotifications();
        if (mounted && response.success) {
          setNotifications(response.data || []);
          setUnreadCount(response.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleNotifications = async () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    setProfileOpen(false);

    if (next && unreadCount > 0) {
      try {
        await markAllNotificationsRead();
        setUnreadCount(0);
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      } catch (error) {
        console.error("Failed to mark notifications read:", error);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !searchValue.trim()) return;
    navigate(`/employees?q=${encodeURIComponent(searchValue.trim())}`);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  const initial = user?.firstName?.charAt(0).toUpperCase() || "?";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onOpenMobileMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>

        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => (
            <span key={crumb.path} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-sep">/</span>}
              <span className={index === crumbs.length - 1 ? "breadcrumb-current" : ""}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="topbar-right" ref={menuRef}>
        {isAdmin && (
          <form className="topbar-search" onSubmit={handleSearchSubmit}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        )}

        <div className="topbar-menu-anchor">
          <button
            className="topbar-icon-btn"
            title="Notifications"
            onClick={handleToggleNotifications}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="topbar-dropdown notification-dropdown">
              <div className="topbar-dropdown-title">Notifications</div>
              {notifications.length === 0 ? (
                <div className="topbar-dropdown-empty">No notifications yet</div>
              ) : (
                notifications.map((item) => (
                  <div className="notification-item" key={item._id}>
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small>{formatRelativeDate(item.createdAt)}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="topbar-menu-anchor">
          <button
            className="topbar-profile-btn"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotificationsOpen(false);
            }}
          >
            <div className="topbar-avatar">{initial}</div>
            <div className="topbar-profile-info">
              <strong>{fullName || "User"}</strong>
              <span>{user?.role}</span>
            </div>
            <ChevronDown size={14} className={profileOpen ? "chevron-open" : ""} />
          </button>

          {profileOpen && (
            <div className="topbar-dropdown profile-dropdown">
              <button onClick={() => navigate("/my-info")}>
                <UserRound size={16} /> My Profile
              </button>
              <button onClick={() => navigate("/settings")}>
                <Settings size={16} /> Settings
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="logout-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
