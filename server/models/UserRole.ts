import mongoose, { Document, Schema } from "mongoose";

export interface IUserRole extends Document {
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

const userRoleSchema = new Schema<IUserRole>(
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

const UserRole = mongoose.model<IUserRole>(
  "UserRole",
  userRoleSchema
);

export default UserRole;