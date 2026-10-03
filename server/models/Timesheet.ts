import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface ITimesheet extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  totalHours: number;
  status:
    | "Pending"
    | "Approved"
    | "Rejected";
}

const timesheetSchema =
  new Schema<ITimesheet>(
    {
      employee: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      date: {
        type: Date,
        required: true,
      },

      totalHours: {
        type: Number,
        default: 0,
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

const Timesheet =
  mongoose.model<ITimesheet>(
    "Timesheet",
    timesheetSchema
  );

export default Timesheet;