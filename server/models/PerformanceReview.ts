import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IPerformanceReview
  extends Document {
  employee: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewPeriod: string;
  status:
    | "Pending"
    | "Completed";
  dueDate?: Date;
  rating?: number;
  comments?: string;
}

const performanceReviewSchema =
  new Schema<IPerformanceReview>(
    {
      employee: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      reviewer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      reviewPeriod: {
        type: String,
        required: true,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Completed",
        ],
        default: "Pending",
      },

      dueDate: {
        type: Date,
      },

      rating: {
        type: Number,
        min: 1,
        max: 5,
      },

      comments: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

const PerformanceReview =
  mongoose.model<IPerformanceReview>(
    "PerformanceReview",
    performanceReviewSchema
  );

export default PerformanceReview;