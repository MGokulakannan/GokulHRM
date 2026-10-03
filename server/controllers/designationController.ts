import { Request, Response } from "express";
import {
  createDesignationService,
  getAllDesignationService,
  getDesignationByIdService,
 updateDesignationService,
 deleteDesignationService,
} from "../services/designationService";
export const createDesignation = async (
  req: Request,
  res: Response
) => {
  try {
    const designation =
      await createDesignationService(req.body);

    return res.status(201).json({
      success: true,
      message: "Designation Created Successfully",
      data: designation,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllDesignations = async (
  req: Request,
  res: Response
) => {
    try {
        const designations =await getAllDesignationService();
        return res.status(200).json({
            success: true,
            message: "Designations retrieved successfully",
            data: designations,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const getDesignationById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
    try {
        const designation = await getDesignationByIdService(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Designation retrieved successfully",
            data: designation,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const updateDesignation = async (
  req: Request<{ id: string }>,
  res: Response
) => {
    try {
        const designation =
  await updateDesignationService(
    req.params.id,
    req.body
  );
        return res.status(200).json({
            success: true,
            message: "Designation updated successfully",
            data: designation,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const deleteDesignation = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    await deleteDesignationService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Designation Deleted Successfully",
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};