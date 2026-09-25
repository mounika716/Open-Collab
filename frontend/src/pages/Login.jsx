import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import GalaxyBackground from "../components/background/GalaxyBackground";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, getPostAuthPath } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  /*
   * Hide the custom Target Cursor on the login page.
   * Form inputs should use the normal browser text cursor.
   */
  

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login(
        form.email,
        form.password
      );

    navigate(getPostAuthPath(response.user));

          
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to login. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* Galaxy background */}
      <div className="login-galaxy">
        <GalaxyBackground
          transparent
          mouseInteraction
          density={1.2}
          glowIntensity={0.25}
          saturation={0}
          hueShift={0}
          twinkleIntensity={0.3}
          rotationSpeed={0.03}
          repulsionStrength={0.5}
          autoCenterRepulsion={0}
          starSpeed={0.3}
          speed={0.5}
        />
      </div>

      <div className="login-overlay" />

      <div className="login-content">
        {/* Navbar */}
        <nav className="login-nav">
          <Link to="/" className="login-logo">
            <span className="logo-mark">O</span>
            <span>Open Collab</span>
          </Link>

          <Link to="/" className="back-link">
            Back to home
          </Link>
        </nav>

        {/* Login */}
        <section className="login-wrapper">
          <div className="login-card">
            <div className="login-card-top">
              <div className="login-badge">
                OPEN COLLAB
              </div>

              <h1>
                Welcome <span>back.</span>
              </h1>

              <p>
                Continue your journey from skills to
                opportunities.
              </p>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="login-form"
            >
              {/* Email */}
              <div className="input-group">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked
                      )
                    }
                  />

                  <span>Remember me</span>
                </label>
              </div>

              {/* Sign in */}
              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </span>

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>or continue with</span>
            </div>

            {/* Social login */}
            <div className="social-login">
              <button
  type="button"
  className="social-button"
  onClick={() => {
    window.location.href =
  `${import.meta.env.VITE_API_URL}/auth/google`;
  }}
>
  <span className="google-icon">G</span>
  <span>Google</span>
</button>

              <button
                type="button"
                className="social-button"
                onClick={() => {
  window.location.href =
    "http://localhost:5000/api/auth/github";
}}
              >
                <svg
                  className="github-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.01c-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.69 1.26 3.35.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .3.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
                  />
                </svg>

                <span>GitHub</span>
              </button>
            </div>

            {/* Register */}
            <p className="register-text">
              Don't have an account?{" "}
              <Link to="/register">
                Create one
              </Link>
            </p>
          </div>

          <div className="login-footer-note">
            <span className="status-dot" />
            Built for students, institutions & industry
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;