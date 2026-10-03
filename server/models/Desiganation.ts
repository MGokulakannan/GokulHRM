import mongoose, { Schema, Document } from "mongoose";

export interface IDesignation extends Document {
  name: string;
  department: mongoose.Types.ObjectId;
  description: string;
  status: string;
}

const designationSchema = new Schema<IDesignation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    description: {
      type: String,
      default: "",
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

export default mongoose.model<IDesignation>(
  "Designation",
  designationSchema
);