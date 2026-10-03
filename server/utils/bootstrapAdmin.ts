import User from "../models/Users";
import hashPassword from "./hashPassword";
import { getNextEmployeeId } from "../services/employeeService";

// Creates the first Admin from ADMIN_EMAIL / ADMIN_PASSWORD, but only when no
// Admin exists yet. Lets a fresh deployment (no shell access) get a login;
// once an Admin exists these variables are ignored and can be removed.
export const bootstrapAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  if (await User.exists({ role: "Admin" })) {
    return;
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await User.create({
    employeeId: await getNextEmployeeId(),
    firstName: process.env.ADMIN_FIRST_NAME || "System",
    lastName: process.env.ADMIN_LAST_NAME || "Admin",
    email,
    password: await hashPassword(password),
    role: "Admin",
    status: "Active",
  });

  console.log(`Created initial admin account: ${email}`);
};
