import api from "./api";

export interface PayGrade {
  _id: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

export const getPayGrades = async () => {
  const response = await api.get("/pay-grades");
  return response.data;
};

export const getPayGradeById = async (id: string) => {
  const response = await api.get(`/pay-grades/${id}`);
  return response.data;
};

export const createPayGrade = async (data: {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}) => {
  const response = await api.post("/pay-grades", data);
  return response.data;
};

export const updatePayGrade = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {
  const response = await api.put(`/pay-grades/${id}`, data);
  return response.data;
};

export const deletePayGrade = async (id: string) => {
  const response = await api.delete(`/pay-grades/${id}`);
  return response.data;
};