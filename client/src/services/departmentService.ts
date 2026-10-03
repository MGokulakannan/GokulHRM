import api from "./api";

export interface Department {
  _id: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export const createDepartment = async (data: {
  name: string;
  description?: string;
  status?: string;
}) => {
  const response = await api.post("/departments", data);
  return response.data;
};

export const updateDepartment = async (
  id: string,
  data: Partial<{ name: string; description: string; status: string }>
) => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};
