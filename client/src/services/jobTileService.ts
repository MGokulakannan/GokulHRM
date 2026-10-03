import api from "./api";

export interface JobTitle {
  _id: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

export const getJobTitles = async () => {
  const response = await api.get("/job-titles");
  return response.data;
};

export const getJobTitleById = async (id: string) => {
  const response = await api.get(`/job-titles/${id}`);
  return response.data;
};

export const createJobTitle = async (data: {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}) => {
  const response = await api.post("/job-titles", data);
  return response.data;
};

export const updateJobTitle = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {
  const response = await api.put(
    `/job-titles/${id}`,
    data
  );

  return response.data;
};

export const deleteJobTitle = async (id: string) => {
  const response = await api.delete(
    `/job-titles/${id}`
  );

  return response.data;
};