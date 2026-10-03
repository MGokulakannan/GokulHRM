import api from "./api";

export interface EmploymentStatus {
  _id: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

export const getEmploymentStatuses = async () => {
  const response = await api.get("/employment-statuses");

  return response.data;
};

export const getEmploymentStatusById = async (
  id: string
) => {
  const response = await api.get(
    `/employment-statuses/${id}`
  );

  return response.data;
};

export const createEmploymentStatus = async (data: {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}) => {
  const response = await api.post(
    "/employment-statuses",
    data
  );

  return response.data;
};

export const updateEmploymentStatus = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {
  const response = await api.put(
    `/employment-statuses/${id}`,
    data
  );

  return response.data;
};

export const deleteEmploymentStatus = async (
  id: string
) => {
  const response = await api.delete(
    `/employment-statuses/${id}`
  );

  return response.data;
};