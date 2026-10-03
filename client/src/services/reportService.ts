import api from "./api";

export const getOverviewReport = async () => {
  const response = await api.get("/reports/overview");
  return response.data;
};

export const getLeaveReport = async () => {
  const response = await api.get("/reports/leave");
  return response.data;
};

export const getAttendanceReport = async (from?: string, to?: string) => {
  const response = await api.get("/reports/attendance", { params: { from, to } });
  return response.data;
};

export const getEmployeeReport = async () => {
  const response = await api.get("/reports/employees");
  return response.data;
};
