import api from "./api";

export interface LeaveType {
  _id: string;
  name: string;
  daysPerYear: number;
  status: "Active" | "Inactive";
}

export const getLeaveTypes = async () => {
  const response = await api.get("/leave-types");
  return response.data;
};

export const createLeaveType = async (data: {
  name: string;
  daysPerYear: number;
  status?: string;
}) => {
  const response = await api.post("/leave-types", data);
  return response.data;
};

export const updateLeaveType = async (
  id: string,
  data: Partial<{ name: string; daysPerYear: number; status: string }>
) => {
  const response = await api.put(`/leave-types/${id}`, data);
  return response.data;
};

export const deleteLeaveType = async (id: string) => {
  const response = await api.delete(`/leave-types/${id}`);
  return response.data;
};
