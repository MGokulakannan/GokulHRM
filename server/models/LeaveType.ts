import mongoose, { Document, Schema } from "mongoose";

export interface ILeaveType extends Document {
  name: string;
  daysPerYear: number;
  status: "Active" | "Inactive";
}

const leaveTypeSchema = new Schema<ILeaveType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    daysPerYear: {
      type: Number,
      required: true,
      default: 12,
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

export default mongoose.model<ILeaveType>("LeaveType", leaveTypeSchema);
