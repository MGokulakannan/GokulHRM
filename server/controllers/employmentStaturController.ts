import { Request, Response } from "express";

import {
  getAllEmploymentStatuses,
  getEmploymentStatusById,
  createEmploymentStatus,
  updateEmploymentStatus,
  deleteEmploymentStatus,
} from "../services/employmentStatusService";

export const getEmploymentStatuses = async (
  req: Request,
  res: Response
) => {
  try {
    const employmentStatuses =
      await getAllEmploymentStatuses();

    return res.status(200).json(employmentStatuses);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch employment statuses",
    });
  }
};

export const getEmploymentStatus = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const employmentStatus =
      await getEmploymentStatusById(id);

    return res.status(200).json(employmentStatus);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message:
        error instanceof Error
          ? error.message
          : "Employment status not found",
    });
  }
};

export const addEmploymentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Employment status name is required",
      });
    }

    const employmentStatus =
      await createEmploymentStatus({
        name,
        description,
        status,
      });

    return res.status(201).json(employmentStatus);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create employment status",
    });
  }
};

export const editEmploymentStatus = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const employmentStatus =
      await updateEmploymentStatus(id, req.body);

    return res.status(200).json(employmentStatus);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to update employment status",
    });
  }
};

export const removeEmploymentStatus = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteEmploymentStatus(id);

    return res.status(200).json({
      message: "Employment status deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message:
        error instanceof Error
          ? error.message
          : "Employment status not found",
    });
  }
};