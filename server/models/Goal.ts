import mongoose, { Document, Schema } from "mongoose";

export interface IGoal extends Document {
  employee: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  status: "Not Started" | "In Progress" | "Completed";
  progress: number;
}

const goalSchema = new Schema<IGoal>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGoal>("Goal", goalSchema);
