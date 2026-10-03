import mongoose from "mongoose";
import JobTitle from "../models/JobTitle";

export const getAllJobTitlesService = async () => {
  return await JobTitle.find().sort({
    createdAt: -1,
  });
};

export const getJobTitleByIdService = async (
  id: string
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid job title ID");
  }

  const jobTitle = await JobTitle.findById(id);

  if (!jobTitle) {
    throw new Error("Job title not found");
  }

  return jobTitle;
};

export const createJobTitleService = async (data: {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}) => {
  const existingJobTitle =
    await JobTitle.findOne({
      name: data.name,
    });

  if (existingJobTitle) {
    throw new Error(
      "Job title with this name already exists"
    );
  }

  return await JobTitle.create({
    name: data.name,
    description: data.description || "",
    status: data.status || "Active",
  });
};

export const updateJobTitleService = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid job title ID");
  }

  if (data.name) {
    const existingJobTitle =
      await JobTitle.findOne({
        name: data.name,
        _id: { $ne: id },
      });

    if (existingJobTitle) {
      throw new Error(
        "Job title with this name already exists"
      );
    }
  }

  const jobTitle =
    await JobTitle.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

  if (!jobTitle) {
    throw new Error("Job title not found");
  }

  return jobTitle;
};

export const deleteJobTitleService = async (
  id: string
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid job title ID");
  }

  const jobTitle =
    await JobTitle.findByIdAndDelete(id);

  if (!jobTitle) {
    throw new Error("Job title not found");
  }

  return jobTitle;
};