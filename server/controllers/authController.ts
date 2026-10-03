import { Request, Response } from "express";
import User from "../models/Users"; // Change to Users if your file name is Users.ts
import comparePassword from "../utils/comparePassword";
import generateToken from "../utils/generateToken";
import hashPassword from "../utils/hashPassword";
import { createEmployeeService } from "../services/authService";
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }
    const token = generateToken(user._id.toString(), user.role);
const userObject = user.toObject();

const { password: hashedPassword, ...userData } = userObject;
return res.status(200).json({
  success: true,
  message: "Login Successful",
  token,
  user: userData,
});
  } catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
};
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Self-service profile update. Only a safe subset of fields can be
// changed by the employee themselves - department, designation, role,
// email and status remain admin-controlled via the Employees module.
export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { phone, gender, profileImage } = req.body;

    const allowedUpdates: Record<string, any> = {};
    if (phone !== undefined) allowedUpdates.phone = phone;
    if (gender !== undefined) allowedUpdates.gender = gender;
    if (profileImage !== undefined) allowedUpdates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
      returnDocument: "after",
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await comparePassword(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const user = await createEmployeeService(req.body);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};