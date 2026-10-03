import { Request, Response } from "express";

import {
  getAllUserRolesService,
  getUserRoleByIdService,
  createUserRoleService,
  updateUserRoleService,
  deleteUserRoleService,
} from "../services/userRoleService";


/* =========================================
   GET ALL USER ROLES
========================================= */

export const getUserRoles = async (
  req: Request,
  res: Response
) => {
  try {

    const roles = await getAllUserRolesService();

    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });

  } catch (error) {

    console.error(
      "Error fetching user roles:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch user roles",
    });
  }
};


/* =========================================
   GET USER ROLE BY ID
========================================= */

export const getUserRoleById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {

    const role =
      await getUserRoleByIdService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: role,
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "User role not found",
    });
  }
};


/* =========================================
   CREATE USER ROLE
========================================= */

export const createUserRole = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      name,
      description,
      status,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const role =
      await createUserRoleService({
        name: name.trim(),
        description,
        status,
      });

    return res.status(201).json({
      success: true,
      message: "User role created successfully",
      data: role,
    });

  } catch (error) {

    console.error(
      "CREATE USER ROLE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create user role",
    });
  }
};


/* =========================================
   UPDATE USER ROLE
========================================= */

export const updateUserRole = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {

    const role =
      await updateUserRoleService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: role,
    });

  } catch (error) {

    console.error(
      "UPDATE USER ROLE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update user role",
    });
  }
};


/* =========================================
   DELETE USER ROLE
========================================= */

export const deleteUserRole = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {

    await deleteUserRoleService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "User role deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE USER ROLE ERROR:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "User role not found",
    });
  }
};