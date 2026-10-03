import { Request, Response } from "express";
import User from "../models/Users";
import {
  createEmployeeService,
  deleteEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
} from "../services/employeeService";

// CREATE EMPLOYEE
export const createEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const employee = await createEmployeeService(req.body);

    return res.status(201).json({
      success: true,
      message: "Employee Created Successfully",
      data: employee,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL EMPLOYEES
export const getAllEmployees = async (
  req: Request,
  res: Response
) => {
  try {
    const employees = await getAllEmployeesService();

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET EMPLOYEE BY ID
export const getEmployeeById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const employee = await getEmployeeByIdService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE EMPLOYEE
export const updateEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const employee = await updateEmployeeService(
      req.params.id as string,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Employee Updated Successfully",
      data: employee,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE EMPLOYEE
export const deleteEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteEmployeeService(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      message: "Employee Deleted Successfully",
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};