import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  IdCard,
  Clock,
  CalendarDays,
  Briefcase,
  Target,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import "./AppSidebar.css";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Array<"Admin" | "Employee">;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Workforce",
    items: [
      { to: "/employees", label: "Employees", icon: Users, roles: ["Admin"] },
      { to: "/departments", label: "Departments", icon: Building2, roles: ["Admin"] },
      { to: "/designations", label: "Designations", icon: IdCard, roles: ["Admin"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/attendance", label: "Attendance", icon: Clock },
      { to: "/leave", label: "Leave Management", icon: CalendarDays },
    ],
  },
  {
    label: "Talent",
    items: [
      { to: "/recruitment", label: "Recruitment", icon: Briefcase, roles: ["Admin"] },
      { to: "/performance", label: "Performance", icon: Target },
    ],
  },
  {
    label: "Insights",
    items: [{ to: "/reports", label: "Reports", icon: BarChart3, roles: ["Admin"] }],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const AppSidebar = ({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: AppSidebarProps) => {
  const { user, logout } = useAuth();

  const isVisible = (item: NavItem) => !item.roles || (user && item.roles.includes(user.role));

  const initial = user?.firstName?.charAt(0).toUpperCase() || "?";

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`app-sidebar ${collapsed ? "app-sidebar-collapsed" : ""} ${mobileOpen ? "app-sidebar-mobile-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-mark">GH</div>
            {!collapsed && <span className="brand-name">Gokul HRM</span>}
          </div>

          <button className="sidebar-mobile-close" onClick={onCloseMobile} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group, groupIndex) => {
            const visibleItems = group.items.filter(isVisible);
            if (visibleItems.length === 0) return null;

            return (
              <div className="sidebar-group" key={groupIndex}>
                {group.label && !collapsed && (
                  <div className="sidebar-group-label">{group.label}</div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                      }
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="sidebar-link-icon" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            onClick={onCloseMobile}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings size={18} className="sidebar-link-icon" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initial}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <strong>
                  {user?.firstName} {user?.lastName}
                </strong>
                <span>{user?.role}</span>
              </div>
            )}
            {!collapsed && (
              <button className="sidebar-logout" onClick={logout} title="Logout" aria-label="Logout">
                <LogOut size={16} />
              </button>
            )}
          </div>

          <button
            className="sidebar-collapse-toggle"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
