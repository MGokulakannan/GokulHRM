import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import { getApiError } from "../utils/apiError";
import { AuthContext } from "./authContextValue";
import type { AuthContextValue, AuthUser, LoginResult } from "./authContextValue";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const loadFromStorage = async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      setInitializing(false);
      return;
    }

    try {
      const parsedUser: AuthUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);

      const response = await api.get("/auth/me");
      if (response.data?.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (!response.data?.success) {
        return {
          success: false,
          message: response.data?.message || "Login failed",
        };
      }

      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getApiError(error, "Unable to reach the server. Please try again."),
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data?.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    initializing,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    isAdmin: user?.role === "Admin",
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
