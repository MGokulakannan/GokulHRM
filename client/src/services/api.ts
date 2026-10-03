import axios from "axios";

const api = axios.create({
  // Production builds must set VITE_API_URL; without it we fall back to a same-origin
  // /api so a missing setting fails visibly instead of silently calling localhost.
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "/api"),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// If the server ever rejects our token (expired, invalid, or the
// account was deactivated), clear the stale session and send the
// user back to login instead of leaving the UI stuck on a failed
// request.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isLoginRequest = error?.config?.url?.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
