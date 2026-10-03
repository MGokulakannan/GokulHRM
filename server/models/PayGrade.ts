import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IPayGrade extends Document {
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

const payGradeSchema = new Schema<IPayGrade>(
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

const PayGrade = mongoose.model<IPayGrade>(
  "PayGrade",
  payGradeSchema
);

export default PayGrade;