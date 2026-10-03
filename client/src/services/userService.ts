import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/employees");

  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(
    `/employees/${id}`
  );

  return response.data;
};