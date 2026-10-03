import { Request, Response } from "express";

import {
  getAllPayGradesService,
  getPayGradeByIdService,
  createPayGradeService,
  updatePayGradeService,
  deletePayGradeService,
} from "../services/payGradeService";


export const getPayGrades = async (
  req: Request,
  res: Response
) => {

  try {

    const payGrades =
      await getAllPayGradesService();

    return res.status(200).json({
      success: true,
      count: payGrades.length,
      data: payGrades,
    });

  } catch (error) {

    console.error(
      "Error fetching pay grades:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch pay grades",
    });
  }
};


export const getPayGradeById = async (
  req: Request<{ id: string }>,
  res: Response
) => {

  try {

    const payGrade =
      await getPayGradeByIdService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: payGrade,
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Pay grade not found",
    });
  }
};


export const createPayGrade = async (
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
        message:
          "Pay grade name is required",
      });
    }


    const payGrade =
      await createPayGradeService({
        name: name.trim(),
        description,
        status,
      });


    return res.status(201).json({
      success: true,
      message:
        "Pay grade created successfully",
      data: payGrade,
    });

  } catch (error) {

    console.error(
      "CREATE PAY GRADE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create pay grade",
    });
  }
};


export const updatePayGrade = async (
  req: Request<{ id: string }>,
  res: Response
) => {

  try {

    const payGrade =
      await updatePayGradeService(
        req.params.id,
        req.body
      );


    return res.status(200).json({
      success: true,
      message:
        "Pay grade updated successfully",
      data: payGrade,
    });

  } catch (error) {

    console.error(
      "UPDATE PAY GRADE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update pay grade",
    });
  }
};


export const deletePayGrade = async (
  req: Request<{ id: string }>,
  res: Response
) => {

  try {

    await deletePayGradeService(
      req.params.id
    );


    return res.status(200).json({
      success: true,
      message:
        "Pay grade deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE PAY GRADE ERROR:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Pay grade not found",
    });
  }
};