import User from "../models/Users";
import hashPassword from "../utils/hashPassword";
import { getNextEmployeeId } from "./employeeService";

interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Admin" | "Employee";
  department: string;
  designation: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
}

export const createEmployeeService = async (
  data: CreateEmployeeData
) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const employeeId = await getNextEmployeeId();

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    employeeId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    department: data.department,
    designation: data.designation,
    phone: data.phone,
    gender: data.gender,
    status: "Active",
    dateOfJoining: new Date(),
  });

  return user;
};