import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./Login.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!initializing && isAuthenticated) {
    const redirectTo = (location.state as { from?: string })?.from || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(identifier.trim(), password);

    setSubmitting(false);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-mark">GH</div>
          <h1>Gokul HRM</h1>
          <p>Sign in to manage your workforce</p>
        </div>

        {error && <div className="login-alert">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-identifier">Email or Employee ID</label>
            <input
              id="login-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@company.com or EMP0001"
              autoCapitalize="none"
              spellCheck={false}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="login-hint">
            <strong>Demo accounts (development only)</strong>
            <span>Admin: admin@gokulhrm.com / Admin@123</span>
            <span>Employee: employee@gokulhrm.com (or ID EMP0009) / Employee@123</span>
          </div>
        )}

        <div className="login-footer">© 2026 Gokul HRM</div>
      </div>
    </div>
  );
};

export default Login;
