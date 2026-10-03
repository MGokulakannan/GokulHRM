import UserRole from "../models/UserRole";
import mongoose from "mongoose";


/* =========================================
   GET ALL USER ROLES
========================================= */

export const getAllUserRolesService = async () => {
  return await UserRole.find().sort({
    createdAt: -1,
  });
};


/* =========================================
   GET USER ROLE BY ID
========================================= */

export const getUserRoleByIdService = async (
  id: string
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user role ID");
  }

  const role = await UserRole.findById(id);

  if (!role) {
    throw new Error("User role not found");
  }

  return role;
};


/* =========================================
   CREATE USER ROLE
========================================= */

export const createUserRoleService = async (data: {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}) => {

  const existingRole = await UserRole.findOne({
    name: data.name,
  });

  if (existingRole) {
    throw new Error(
      "User role with this name already exists"
    );
  }

  const role = await UserRole.create({
    name: data.name,
    description: data.description || "",
    status: data.status || "Active",
  });

  return role;
};


/* =========================================
   UPDATE USER ROLE
========================================= */

export const updateUserRoleService = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user role ID");
  }

  if (data.name) {

    const existingRole = await UserRole.findOne({
      name: data.name,
      _id: {
        $ne: id,
      },
    });

    if (existingRole) {
      throw new Error(
        "User role with this name already exists"
      );
    }
  }

  const role = await UserRole.findByIdAndUpdate(
    id,
    data,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!role) {
    throw new Error("User role not found");
  }

  return role;
};


/* =========================================
   DELETE USER ROLE
========================================= */

export const deleteUserRoleService = async (
  id: string
) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user role ID");
  }

  const role = await UserRole.findByIdAndDelete(id);

  if (!role) {
    throw new Error("User role not found");
  }

  return role;
};