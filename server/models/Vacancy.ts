import mongoose, { Document, Schema } from "mongoose";

export interface IVacancy extends Document {
  title: string;
  department: mongoose.Types.ObjectId;
  designation: mongoose.Types.ObjectId;
  location: string;
  status: "Open" | "On Hold" | "Closed";
  description?: string;
  postedDate: Date;
}

const vacancySchema = new Schema<IVacancy>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    designation: {
      type: Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Open", "On Hold", "Closed"],
      default: "Open",
    },
    description: {
      type: String,
      default: "",
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVacancy>("Vacancy", vacancySchema);
