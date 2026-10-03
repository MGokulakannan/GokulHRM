import mongoose from "mongoose";

import PayGrade from "../models/PayGrade";


export const getAllPayGradesService = async () => {
  return await PayGrade.find().sort({
    createdAt: -1,
  });
};


export const getPayGradeByIdService = async (
  id: string
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid pay grade ID");
  }

  const payGrade =
    await PayGrade.findById(id);

  if (!payGrade) {
    throw new Error("Pay grade not found");
  }

  return payGrade;
};


export const createPayGradeService = async (
  data: {
    name: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {

  const existingPayGrade =
    await PayGrade.findOne({
      name: data.name,
    });

  if (existingPayGrade) {
    throw new Error(
      "Pay grade with this name already exists"
    );
  }

  return await PayGrade.create({
    name: data.name,
    description: data.description || "",
    status: data.status || "Active",
  });
};


export const updatePayGradeService = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid pay grade ID");
  }

  if (data.name) {

    const existingPayGrade =
      await PayGrade.findOne({
        name: data.name,
        _id: {
          $ne: id,
        },
      });

    if (existingPayGrade) {
      throw new Error(
        "Pay grade with this name already exists"
      );
    }
  }

  const payGrade =
    await PayGrade.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

  if (!payGrade) {
    throw new Error(
      "Pay grade not found"
    );
  }

  return payGrade;
};


export const deletePayGradeService = async (
  id: string
) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid pay grade ID");
  }

  const payGrade =
    await PayGrade.findByIdAndDelete(id);

  if (!payGrade) {
    throw new Error(
      "Pay grade not found"
    );
  }

  return payGrade;
};