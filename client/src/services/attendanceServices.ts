import api from "./api";

export interface AttendanceRecord {
  _id: string;
  employee:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
      };
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: "Present" | "Absent" | "Leave";
}

export const getTodayAttendance = async () => {
  const response = await api.get("/attendance/today");
  return response.data;
};

export const checkIn = async () => {
  const response = await api.post("/attendance/check-in");
  return response.data;
};

export const checkOut = async () => {
  const response = await api.post("/attendance/check-out");
  return response.data;
};

export const getMyAttendance = async (from?: string, to?: string) => {
  const response = await api.get("/attendance/me", { params: { from, to } });
  return response.data;
};

export const getAllAttendance = async (params?: {
  from?: string;
  to?: string;
  employee?: string;
}) => {
  const response = await api.get("/attendance", { params });
  return response.data;
};
