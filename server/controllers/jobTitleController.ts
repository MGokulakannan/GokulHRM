import { Request, Response } from "express";

import {
  getAllJobTitlesService,
  getJobTitleByIdService,
  createJobTitleService,
  updateJobTitleService,
  deleteJobTitleService,
} from "../services/jobTitleService";

export const getJobTitles = async (
  req: Request,
  res: Response
) => {
  try {
    const jobTitles =
      await getAllJobTitlesService();

    return res.status(200).json({
      success: true,
      count: jobTitles.length,
      data: jobTitles,
    });
  } catch (error) {
    console.error(
      "Error fetching job titles:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch job titles",
    });
  }
};

export const getJobTitleById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const jobTitle =
      await getJobTitleByIdService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: jobTitle,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Job title not found",
    });
  }
};

export const createJobTitle = async (
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
        message: "Job title name is required",
      });
    }

    const jobTitle =
      await createJobTitleService({
        name: name.trim(),
        description,
        status,
      });

    return res.status(201).json({
      success: true,
      message:
        "Job title created successfully",
      data: jobTitle,
    });
  } catch (error) {
    console.error(
      "CREATE JOB TITLE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create job title",
    });
  }
};

export const updateJobTitle = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const jobTitle =
      await updateJobTitleService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Job title updated successfully",
      data: jobTitle,
    });
  } catch (error) {
    console.error(
      "UPDATE JOB TITLE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update job title",
    });
  }
};

export const deleteJobTitle = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    await deleteJobTitleService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Job title deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE JOB TITLE ERROR:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Job title not found",
    });
  }
};