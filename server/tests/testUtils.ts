import mongoose from "mongoose";
import User from "../models/Users";
import hashPassword from "../utils/hashPassword";

export const connectTestDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
};

export const disconnectTestDb = async () => {
  await mongoose.connection.close();
};

let counter = 0;

export const createTestUser = async (overrides: {
  role: "Admin" | "Employee";
  email?: string;
}) => {
  counter += 1;

  const email = overrides.email || `test.user.${Date.now()}.${counter}@gokulhrm.test`;

  const user = await User.create({
    employeeId: `TEST${Date.now()}${counter}`,
    firstName: "Test",
    lastName: overrides.role,
    email,
    password: await hashPassword("Password@123"),
    role: overrides.role,
    department: "",
    designation: "",
    phone: "9999999999",
    gender: "Male",
    status: "Active",
  });

  return { user, email, password: "Password@123" };
};
