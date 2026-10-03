import User from "../models/Users";

import hashPassword from "../utils/hashPassword";
import generateEmployeeId from "../utils/generateEmployeeId";

// ========================================
// NEXT EMPLOYEE ID
// Derived from the highest existing numeric
// suffix rather than the document count, so
// deleted/non-contiguous IDs never collide.
// ========================================

export const getNextEmployeeId = async (): Promise<string> => {
  const employees = await User.find().select("employeeId").lean();

  const maxNumber = employees.reduce((max, employee: any) => {
    const match = /^EMP(\d+)$/.exec(employee.employeeId || "");
    const number = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, number);
  }, 0);

  return generateEmployeeId(maxNumber + 1);
};

// ========================================
// CREATE EMPLOYEE
// ========================================

export const createEmployeeService = async (data: any) => {
  // 1. Check whether email already exists
  const existingEmployee = await User.findOne({
    email: data.email,
  });

  if (existingEmployee) {
    throw new Error("Employee with this email already exists");
  }

  // 2. Generate employee ID
  const employeeId = await getNextEmployeeId();

  // 4. Hash password
  const hashedPassword = await hashPassword(data.password);

  // 5. Create employee
  const employee = await User.create({
    ...data,
    employeeId,
    password: hashedPassword,
  });

  // 6. Convert Mongoose document to normal object
  const employeeData = employee.toObject();

  // 7. Remove password from response
  const { password, ...employeeWithoutPassword } = employeeData;

  // 8. Return employee without password
  return employeeWithoutPassword;
};

// ========================================
// GET ALL EMPLOYEES
// ========================================

export const getAllEmployeesService = async () => {
  return await User.find().select("-password").lean();
};

// ========================================
// GET EMPLOYEE BY ID
// ========================================

export const getEmployeeByIdService = async (id: string) => {
  const employee = await User.findById(id)
    .select("-password");

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

// ========================================
// UPDATE EMPLOYEE
// ========================================

export const updateEmployeeService = async (
  id: string,
  data: any
) => {
  const employee = await User.findByIdAndUpdate(
    id,
    data,
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).select("-password");

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

// ========================================
// DELETE EMPLOYEE
// ========================================

export const deleteEmployeeService = async (id: string) => {
  const employee = await User.findByIdAndDelete(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};