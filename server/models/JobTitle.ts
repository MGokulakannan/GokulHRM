import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IJobTitle extends Document {
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

const jobTitleSchema = new Schema<IJobTitle>(
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

const JobTitle = mongoose.model<IJobTitle>(
  "JobTitle",
  jobTitleSchema
);

export default JobTitle;