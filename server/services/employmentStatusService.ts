import mongoose from "mongoose";
import EmploymentStatus from "../models/EmploymentStatus";

export const getAllEmploymentStatuses = async () => {
  return await EmploymentStatus.find().sort({ createdAt: -1 });
};

export const getEmploymentStatusById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid employment status ID");
  }

  const employmentStatus = await EmploymentStatus.findById(id);

  if (!employmentStatus) {
    throw new Error("Employment status not found");
  }

  return employmentStatus;
};

export const createEmploymentStatus = async (data: {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}) => {
  const existingStatus = await EmploymentStatus.findOne({
    name: data.name.trim(),
  });

  if (existingStatus) {
    throw new Error("Employment status already exists");
  }

  const employmentStatus = new EmploymentStatus({
    name: data.name.trim(),
    description: data.description?.trim() || "",
    status: data.status || "Active",
  });

  return await employmentStatus.save();
};

export const updateEmploymentStatus = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid employment status ID");
  }

  if (data.name) {
    const existingStatus = await EmploymentStatus.findOne({
      name: data.name.trim(),
      _id: { $ne: id },
    });

    if (existingStatus) {
      throw new Error("Employment status already exists");
    }
  }

  const updateData: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }

  if (data.description !== undefined) {
    updateData.description = data.description.trim();
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  const employmentStatus = await EmploymentStatus.findByIdAndUpdate(
    id,
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!employmentStatus) {
    throw new Error("Employment status not found");
  }

  return employmentStatus;
};

export const deleteEmploymentStatus = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid employment status ID");
  }

  const employmentStatus =
    await EmploymentStatus.findByIdAndDelete(id);

  if (!employmentStatus) {
    throw new Error("Employment status not found");
  }

  return employmentStatus;
};