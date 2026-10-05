import { useCallback, useEffect, useState } from "react";
import "./Dashboard.css";

import { getDashboard } from "../../services/dashboardService";
import type { DashboardData } from "../../services/dashboardService";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import { SkeletonCard, SkeletonRows } from "../../components/ui/Skeleton";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboard();
        if (mounted) {
          setDashboardData(data);
          setError("");
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        if (mounted) setError("Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  // Re-fetch without flashing the loading skeleton (used after check-in / check-out).
  const refresh = useCallback(async () => {
    try {
      setDashboardData(await getDashboard());
    } catch (err) {
      console.error("Failed to refresh dashboard:", err);
    }
  }, []);

  if (loading) {
    return (
      <div className="gh-page">
        <div className="row g-3 mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="col-6 col-lg-3" key={index}>
              <SkeletonCard />
            </div>
          ))}
        </div>
        <div className="gh-card" style={{ padding: 20 }}>
          <SkeletonRows rows={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-state dashboard-state-error">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="dashboard-state">No dashboard data available</div>;
  }

  return dashboardData.role === "Admin" ? (
    <AdminDashboard data={dashboardData} />
  ) : (
    <EmployeeDashboard data={dashboardData} onRefresh={refresh} />
  );
};

export default Dashboard;
