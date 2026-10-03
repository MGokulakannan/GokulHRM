import { lazy, Suspense } from "react";
import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// =====================================================
// AUTH
// =====================================================

import Login from "./pages/login/Login";

// =====================================================
// DASHBOARD
// =====================================================

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

// =====================================================
// EMPLOYEES
// =====================================================

const Employee = lazy(() => import("./pages/employee/Employee"));
const EmployeeDetail = lazy(() => import("./pages/employee/EmployeeDetail"));
const Departments = lazy(() => import("./pages/departments/Departments"));
const Designations = lazy(() => import("./pages/designations/Designations"));

// =====================================================
// ADMIN / ORGANIZATION
// =====================================================

const Admin = lazy(() => import("./pages/admin/Admin"));
const UserManagement = lazy(() => import("./pages/admin/user-management/users/UserManagement"));
const UserRoles = lazy(() => import("./pages/admin/user-management/user-roles/UserRoles"));
const JobTitles = lazy(() => import("./pages/admin/job/job-titles/JobTitles"));
const PayGrades = lazy(() => import("./pages/admin/job/pay-grades/PayGrades"));
const EmploymentStatus = lazy(() => import("./pages/admin/job/employment-status/EmploymentStatus"));

// =====================================================
// OTHER MODULES
// =====================================================

const Leave = lazy(() => import("./pages/leave/Leave"));
const Attendance = lazy(() => import("./pages/time/Time"));
const Recruitment = lazy(() => import("./pages/recuritment/Recuritment"));
const MyInfo = lazy(() => import("./pages/my-info/MyInfo"));
const Performance = lazy(() => import("./pages/performance/Performance"));
const Reports = lazy(() => import("./pages/reports/Reports"));
const Settings = lazy(() => import("./pages/settings/Settings"));

// =====================================================
// ROUTE HELPERS
// =====================================================

const withLayout = (
  element: ReactElement,
  roles?: Array<"Admin" | "Employee">
) => (
  <ProtectedRoute roles={roles}>
    <MainLayout>
      <Suspense fallback={<div className="gh-state">Loading...</div>}>{element}</Suspense>
    </MainLayout>
  </ProtectedRoute>
);

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD - all roles */}
        <Route path="/dashboard" element={withLayout(<Dashboard />)} />

        {/* EMPLOYEES - Admin only */}
        <Route
          path="/employees"
          element={withLayout(<Employee />, ["Admin"])}
        />
        <Route
          path="/employees/:id"
          element={withLayout(<EmployeeDetail />, ["Admin"])}
        />

        {/* DEPARTMENTS / DESIGNATIONS - Admin only */}
        <Route
          path="/departments"
          element={withLayout(<Departments />, ["Admin"])}
        />
        <Route
          path="/designations"
          element={withLayout(<Designations />, ["Admin"])}
        />

        {/* ORGANIZATION / ADMIN - Admin only */}
        <Route path="/admin" element={withLayout(<Admin />, ["Admin"])} />
        <Route
          path="/admin/users"
          element={withLayout(<UserManagement />, ["Admin"])}
        />
        <Route
          path="/admin/user-roles"
          element={withLayout(<UserRoles />, ["Admin"])}
        />
        <Route
          path="/admin/job-titles"
          element={withLayout(<JobTitles />, ["Admin"])}
        />
        <Route
          path="/admin/pay-grades"
          element={withLayout(<PayGrades />, ["Admin"])}
        />
        <Route
          path="/admin/employment-status"
          element={withLayout(<EmploymentStatus />, ["Admin"])}
        />

        {/* ATTENDANCE - all roles (content adapts) */}
        <Route path="/attendance" element={withLayout(<Attendance />)} />

        {/* LEAVE - all roles (content adapts) */}
        <Route path="/leave" element={withLayout(<Leave />)} />

        {/* RECRUITMENT - Admin only */}
        <Route
          path="/recruitment"
          element={withLayout(<Recruitment />, ["Admin"])}
        />

        {/* PERFORMANCE - all roles (content adapts) */}
        <Route path="/performance" element={withLayout(<Performance />)} />

        {/* REPORTS - Admin only */}
        <Route path="/reports" element={withLayout(<Reports />, ["Admin"])} />

        {/* SETTINGS - all roles (content adapts) */}
        <Route path="/settings" element={withLayout(<Settings />)} />

        {/* MY PROFILE - all roles */}
        <Route path="/my-info" element={withLayout(<MyInfo />)} />

        {/* ROOT */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* UNKNOWN ROUTE */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
