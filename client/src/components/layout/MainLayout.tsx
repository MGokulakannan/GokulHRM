import { useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import "./MainLayout.css";
import AppSidebar from "./AppSidebar";
import TopNavbar from "./TopNavbar";

interface MainLayoutProps {
  children: ReactNode;
}

const COLLAPSE_STORAGE_KEY = "gh-sidebar-collapsed";

const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setMobileOpen(false);
  }

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      } catch {
        // ignore storage failures (private browsing, etc.)
      }
      return next;
    });
  };

  return (
    <div className={`main-layout ${collapsed ? "main-layout-collapsed" : ""}`}>
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="main-layout-content">
        <TopNavbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="main-layout-page">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
