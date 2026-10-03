import dotenv from "dotenv";
import connectDB from "./config/database";
import User from "./models/Users";
import Department from "./models/Department";
import Designation from "./models/Desiganation";
import hashPassword from "./utils/hashPassword";
import { getNextEmployeeId } from "./services/employeeService";

dotenv.config();

const run = async () => {
  await connectDB();

  let department = await Department.findOne({ name: "Engineering" });
  if (!department) {
    department = await Department.create({
      name: "Engineering",
      description: "Builds and maintains the product",
      status: "Active",
    });
    console.log("Created department: Engineering");
  }

  let hrDepartment = await Department.findOne({ name: "Human Resources" });
  if (!hrDepartment) {
    hrDepartment = await Department.create({
      name: "Human Resources",
      description: "Manages people operations",
      status: "Active",
    });
    console.log("Created department: Human Resources");
  }

  let designation = await Designation.findOne({
    name: "Software Engineer",
    department: department._id,
  });
  if (!designation) {
    designation = await Designation.create({
      name: "Software Engineer",
      department: department._id,
      description: "Writes and ships software",
      status: "Active",
    });
    console.log("Created designation: Software Engineer");
  }

  let hrManagerDesignation = await Designation.findOne({
    name: "HR Manager",
    department: hrDepartment._id,
  });
  if (!hrManagerDesignation) {
    hrManagerDesignation = await Designation.create({
      name: "HR Manager",
      department: hrDepartment._id,
      description: "Oversees HR operations",
      status: "Active",
    });
    console.log("Created designation: HR Manager");
  }

  const existingAdmin = await User.findOne({ email: "admin@gokulhrm.com" });
  if (!existingAdmin) {
    await User.create({
      employeeId: await getNextEmployeeId(),
      firstName: "Gokul",
      lastName: "Admin",
      email: "admin@gokulhrm.com",
      password: await hashPassword("Admin@123"),
      role: "Admin",
      department: String(hrDepartment._id),
      designation: String(hrManagerDesignation._id),
      phone: "9000000001",
      gender: "Male",
      status: "Active",
    });
    console.log("Created admin user: admin@gokulhrm.com / Admin@123");
  } else {
    console.log("Admin user already exists: admin@gokulhrm.com");
  }

  const existingEmployee = await User.findOne({
    email: "employee@gokulhrm.com",
  });
  if (!existingEmployee) {
    await User.create({
      employeeId: await getNextEmployeeId(),
      firstName: "Asha",
      lastName: "Kumar",
      email: "employee@gokulhrm.com",
      password: await hashPassword("Employee@123"),
      role: "Employee",
      department: String(department._id),
      designation: String(designation._id),
      phone: "9000000002",
      gender: "Female",
      status: "Active",
    });
    console.log("Created employee user: employee@gokulhrm.com / Employee@123");
  } else {
    console.log("Employee user already exists: employee@gokulhrm.com");
  }

  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
