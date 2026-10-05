import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { isAxiosError } from "axios";
import api from "../services/api";
import { getApiError } from "../utils/apiError";
import { AuthContext } from "./authContextValue";
import { clearModules } from "./modulesStore";
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

      // Only a rejected token ends the session. A rate limit, server error or
      // network blip must not log the user out - keep the stored session.
      if (isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await api.post("/auth/login", { identifier, password });

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
    clearModules();
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
