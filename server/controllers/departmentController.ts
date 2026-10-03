import { Request, Response } from "express";
import {
  
  getAllDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
  createDepartmentService,
} from "../services/departmentService";


export const createDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    const department = await createDepartmentService(req.body);

    return res.status(201).json({
      success: true,
      message: "Department Created Successfully",
      data: department,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllDepartments = async (
  req: Request,
  res: Response
) => {
  try {
    const departments = await getAllDepartmentsService();

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getDepartmentById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const department = await getDepartmentByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDepartment = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const department = await updateDepartmentService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Department Updated Successfully",
      data: department,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDepartment = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    await deleteDepartmentService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Department Deleted Successfully",
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};