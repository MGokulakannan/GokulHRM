import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface ILeave extends Document {
  employee: mongoose.Types.ObjectId;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status:
    | "Pending"
    | "Approved"
    | "Rejected";
}

const leaveSchema = new Schema<ILeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,

      // Must match mongoose.model("User", ...)
      ref: "User",

      required: true,
    },

    leaveType: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILeave>(
  "Leave",
  leaveSchema
);