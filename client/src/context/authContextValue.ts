import { createContext } from "react";

export interface AuthUser {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Admin" | "Employee";
  department?: string;
  designation?: string;
  phone?: string;
  gender?: string;
  profileImage?: string;
  status?: string;
  dateOfJoining?: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
