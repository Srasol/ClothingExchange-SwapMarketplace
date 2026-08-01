import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaExchangeAlt,
  FaEye,
  FaEyeSlash,
  FaLeaf,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";

import API from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const location = formData.location.trim();
    const password = formData.password;
    const confirmPassword =
      formData.confirmPassword;

    if (
      !name ||
      !email ||
      !phone ||
      !location ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/auth/register", {
        name,
        email,
        phone,
        location,
        password,
      });

      navigate("/", {
        state: {
          registrationSuccess: true,
        },
      });
    } catch (requestError) {
      console.error(
        "Registration error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-container">
        <section className="register-visual-panel">
          <div className="register-brand">
            <span className="register-brand-icon">
              <FaExchangeAlt />
            </span>

            <span>SwapStyle</span>
          </div>

          <div className="register-visual-content">
            <div className="register-small-label">
              <FaLeaf />
              Join sustainable fashion
            </div>

            <h1>
              Build a wardrobe that
              <span> keeps moving.</span>
            </h1>

            <p>
              Create your account, list quality clothing,
              discover nearby styles and exchange without
              unnecessary spending.
            </p>

            <div className="register-benefits">
              <div>
                <FaCheckCircle />
                <span>Create and manage clothing listings</span>
              </div>

              <div>
                <FaMapMarkerAlt />
                <span>Discover swap options near your location</span>
              </div>

              <div>
                <FaLock />
                <span>Secure profile and protected marketplace</span>
              </div>
            </div>
          </div>

          <div className="register-preview-card">
            <div className="register-preview-icon">
              <FaUserPlus />
            </div>

            <div>
              <small>Community growing daily</small>
              <h3>Start your first clothing exchange</h3>
              <p>
                Register in a few simple steps and join the marketplace.
              </p>
            </div>
          </div>
        </section>

        <section className="register-form-panel">
          <div className="register-form-card">
            <div className="register-mobile-logo">
              <span className="register-brand-icon">
                <FaExchangeAlt />
              </span>

              <span>SwapStyle</span>
            </div>

            <div className="register-form-heading">
              <span>Create your account</span>

              <h2>Join SwapStyle</h2>

              <p>
                Enter your details to start listing and exchanging clothes.
              </p>
            </div>

            {error && (
              <div
                className="register-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="register-grid">
                <RegisterField
                  id="name"
                  name="name"
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<FaUser />}
                  autoComplete="name"
                  disabled={loading}
                />

                <RegisterField
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<FaUser />}
                  autoComplete="email"
                  disabled={loading}
                />

                <RegisterField
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={<FaPhoneAlt />}
                  autoComplete="tel"
                  disabled={loading}
                />

                <RegisterField
                  id="location"
                  name="location"
                  label="Location"
                  type="text"
                  placeholder="Enter your city"
                  value={formData.location}
                  onChange={handleChange}
                  icon={<FaMapMarkerAlt />}
                  autoComplete="address-level2"
                  disabled={loading}
                />

                <div className="register-field">
                  <label htmlFor="password">
                    Password
                  </label>

                  <div className="register-input-wrapper">
                    <FaLock className="register-input-icon" />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="register-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="confirmPassword">
                    Confirm Password
                  </label>

                  <div className="register-input-wrapper">
                    <FaLock className="register-input-icon" />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm your password"
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="register-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn register-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="register-divider">
              <span>Already registered?</span>
            </div>

            <Link
              to="/"
              className="btn register-login-button"
            >
              Sign In
            </Link>

            <p className="register-footer-text">
              By registering, you agree to use the marketplace
              responsibly and follow the clothing exchange rules.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function RegisterField({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  autoComplete,
  disabled,
}) {
  return (
    <div className="register-field">
      <label htmlFor={id}>{label}</label>

      <div className="register-input-wrapper">
        <span className="register-input-icon">
          {icon}
        </span>

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default Register;