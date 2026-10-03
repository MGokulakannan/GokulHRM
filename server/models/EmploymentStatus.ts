import mongoose, { Document, Schema } from "mongoose";

export interface IEmploymentStatus extends Document {
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

const employmentStatusSchema = new Schema<IEmploymentStatus>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const EmploymentStatus = mongoose.model<IEmploymentStatus>(
  "EmploymentStatus",
  employmentStatusSchema
);

export default EmploymentStatus;