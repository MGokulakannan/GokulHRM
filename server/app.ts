import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import designationRoutes from "./routes/designationRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import leaveRoutes from "./routes/leaveRoute";
import leaveTypeRoutes from "./routes/leaveTypeRoutes";
import userRoleRoutes from "./routes/userRoleRoutes";
import jobTitleRoutes from "./routes/jobTitleRoutes";
import payGradeRoutes from "./routes/payGradeRoutes";
import employmentStatusRoutes from "./routes/employmentStatusRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import recruitmentRoutes from "./routes/recruitmentRoutes";
import performanceRoutes from "./routes/performanceRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reportRoutes from "./routes/reportRoutes";

import { notFound, errorHandler } from "./middleware/errorMiddleware";
import { apiRateLimiter, loginRateLimiter } from "./middleware/rateLimiter";

const app = express();

/* =========================================
   SECURITY / PARSING MIDDLEWARE
========================================= */

app.use(helmet());

// Only the configured frontend origin(s) may call this API with
// credentials. Falls back to the local dev client if unset.
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5180,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl / same-origin requests with no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.json());

app.use("/api", apiRateLimiter);

/* =========================================
   API ROUTES
========================================= */

app.use("/api/auth/login", loginRateLimiter);
app.use("/api/auth", authRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/designations", designationRoutes);

app.use("/api/leaves", leaveRoutes);

app.use("/api/leave-types", leaveTypeRoutes);

app.use("/api/user-roles", userRoleRoutes);

app.use("/api/job-titles",jobTitleRoutes);

app.use("/api/pay-grades",payGradeRoutes);

app.use("/api/employment-status",employmentStatusRoutes);

app.use("/api/dashboard",dashboardRoutes)

app.use("/api/recruitment", recruitmentRoutes);

app.use("/api/performance", performanceRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/reports", reportRoutes);

/* =========================================
   ROOT
========================================= */

app.get("/", (req, res) => {
  res.send("Gokul HRM Backend Running");
});

/* =========================================
   404 + CENTRALIZED ERROR HANDLING
   Must be registered last.
========================================= */

app.use(notFound);
app.use(errorHandler);

export default app;
