import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaExchangeAlt,
  FaEye,
  FaEyeSlash,
  FaLeaf,
  FaLock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

import API from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(
        "Login error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="container login-container">
        <div className="login-shell">
          <section className="login-showcase">
            <div className="login-brand">
              <span className="login-brand-icon">
                <FaExchangeAlt />
              </span>

              <span>SwapStyle</span>
            </div>

            <div className="login-showcase-content">
              <div className="login-badge">
                <FaLeaf />
                Sustainable fashion marketplace
              </div>

              <h1>
                Exchange clothes.
                <span> Redefine your style.</span>
              </h1>

              <p>
                Discover quality fashion, connect with users near you
                and complete clothing swaps through one secure platform.
              </p>

              <div className="login-feature-list">
                <div>
                  <span className="login-feature-icon">
                    <FaMapMarkerAlt />
                  </span>

                  <div>
                    <strong>Location-based discovery</strong>
                    <small>Find clothing available near you</small>
                  </div>
                </div>

                <div>
                  <span className="login-feature-icon">
                    <FaUsers />
                  </span>

                  <div>
                    <strong>Real-time communication</strong>
                    <small>Chat, reply and share images instantly</small>
                  </div>
                </div>

                <div>
                  <span className="login-feature-icon">
                    <FaShieldAlt />
                  </span>

                  <div>
                    <strong>Protected marketplace</strong>
                    <small>Admin-managed users, listings and swaps</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="login-showcase-footer">
              <span>Swap more</span>
              <span>Spend less</span>
              <span>Waste less</span>
            </div>
          </section>

          <section className="login-form-section">
            <div className="login-form-wrapper">
              <div className="login-form-heading">
                <div className="login-mobile-logo">
                  <span className="login-brand-icon">
                    <FaExchangeAlt />
                  </span>

                  <span>SwapStyle</span>
                </div>

                <span className="login-welcome">Welcome back</span>

                <h2>Sign in to your account</h2>

                <p>
                  Enter your credentials to continue to the marketplace.
                </p>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="login-field">
                  <label htmlFor="email">Email address</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <div className="login-field">
                  <div className="login-password-label">
                    <label htmlFor="password">Password</label>

                    <span className="login-secure-text">
                      <FaLock />
                      Secure login
                    </span>
                  </div>

                  <div className="login-password-input">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowPassword((currentValue) => !currentValue)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn login-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </form>

              <div className="login-divider">
                <span>New to SwapStyle?</span>
              </div>

              <Link
                to="/register"
                className="btn login-register-button"
              >
                Create an account
              </Link>

              <p className="login-terms">
                By continuing, you agree to use the marketplace
                responsibly and follow the clothing exchange rules.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;