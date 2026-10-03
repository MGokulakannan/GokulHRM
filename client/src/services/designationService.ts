import api from "./api";

export interface Designation {
  _id: string;
  name: string;
  department: string | { _id: string; name: string };
  description?: string;
  status: "Active" | "Inactive";
}

export const getDesignations = async () => {
  const response = await api.get("/designations");
  return response.data;
};

export const createDesignation = async (data: {
  name: string;
  department: string;
  description?: string;
  status?: string;
}) => {
  const response = await api.post("/designations", data);
  return response.data;
};

export const updateDesignation = async (
  id: string,
  data: Partial<{ name: string; department: string; description: string; status: string }>
) => {
  const response = await api.put(`/designations/${id}`, data);
  return response.data;
};

export const deleteDesignation = async (id: string) => {
  const response = await api.delete(`/designations/${id}`);
  return response.data;
};
