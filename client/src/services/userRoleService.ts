import api from "./api";

export interface UserRole {
  _id: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

/* =========================================
   GET ALL USER ROLES
========================================= */

export const getUserRoles = async () => {
  const response = await api.get("/user-roles");

  return response.data;
};


/* =========================================
   GET USER ROLE BY ID
========================================= */

export const getUserRoleById = async (id: string) => {
  const response = await api.get(`/user-roles/${id}`);

  return response.data;
};


/* =========================================
   CREATE USER ROLE
========================================= */

export const createUserRole = async (data: {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}) => {
  const response = await api.post(
    "/user-roles",
    data
  );

  return response.data;
};


/* =========================================
   UPDATE USER ROLE
========================================= */

export const updateUserRole = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {
  const response = await api.put(
    `/user-roles/${id}`,
    data
  );

  return response.data;
};


/* =========================================
   DELETE USER ROLE
========================================= */

export const deleteUserRole = async (
  id: string
) => {
  const response = await api.delete(
    `/user-roles/${id}`
  );

  return response.data;
};