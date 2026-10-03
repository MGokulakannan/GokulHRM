import mongoose, { Document, Schema } from "mongoose";

export type CandidateStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview Scheduled"
  | "Interviewed"
  | "Hired"
  | "Rejected";

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone?: string;
  vacancy: mongoose.Types.ObjectId;
  status: CandidateStatus;
  interviewDate?: Date;
  notes?: string;
  appliedDate: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    vacancy: {
      type: Schema.Types.ObjectId,
      ref: "Vacancy",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Interview Scheduled",
        "Interviewed",
        "Hired",
        "Rejected",
      ],
      default: "Applied",
    },
    interviewDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICandidate>("Candidate", candidateSchema);
