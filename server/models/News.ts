import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface INews extends Document {
  title: string;
  description: string;
  publishedDate: Date;
  status: "Published" | "Draft";
}

const newsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    publishedDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model<INews>(
  "News",
  newsSchema
);

export default News;