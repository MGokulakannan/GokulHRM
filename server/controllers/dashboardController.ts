import { Request, Response } from "express";

import {
  getAdminDashboardData,
  getEmployeeDashboardData,
} from "../services/dashboardService";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const dashboard =
      currentUser.role === "Admin"
        ? await getAdminDashboardData()
        : await getEmployeeDashboardData(currentUser.id);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};
