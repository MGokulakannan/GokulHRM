import mongoose, {
  Document as MongoDocument,
  Schema,
} from "mongoose";

export interface IDocument extends MongoDocument {
  name: string;
  fileName: string;
  fileUrl: string;
  fileType: "PDF" | "DOC" | "XLS" | "PPT" | "Other";
  uploadedBy?: mongoose.Types.ObjectId;
}

const documentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      enum: [
        "PDF",
        "DOC",
        "XLS",
        "PPT",
        "Other",
      ],
      default: "Other",
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel =
  mongoose.model<IDocument>(
    "Document",
    documentSchema
  );

export default DocumentModel;