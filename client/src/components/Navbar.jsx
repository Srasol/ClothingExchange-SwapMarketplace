import {
  useEffect,
  useState,
} from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import NotificationBell from "./NotificationBell";
import {
  getImageUrl,
} from "../utils/imageUrl";

import "./../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const getStoredUser = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("user")
        ) || {}
      );
    } catch {
      return {};
    }
  };

  const [user, setUser] =
    useState(getStoredUser);

  useEffect(() => {
    const refreshUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener(
      "profileUpdated",
      refreshUser
    );

    window.addEventListener(
      "storage",
      refreshUser
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        refreshUser
      );

      window.removeEventListener(
        "storage",
        refreshUser
      );
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const profileImageUrl =
    user?.profileImage
      ? getImageUrl(user.profileImage)
      : "";

  const userInitial =
    user?.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow">
      <div className="container">
        <NavLink
          className="navbar-brand fw-bold"
          to="/dashboard"
        >
          🧥 Clothing Exchange
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarContent"
        >
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/dashboard"
              >
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/listings"
              >
                Listings
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/add-listing"
              >
                Add Listing
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/swap-requests"
              >
                Swaps
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/chat"
              >
                Chat
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/profile"
              >
                Profile
              </NavLink>
            </li>
          </ul>

          <div className="navbar-user-section">
            <NotificationBell />

            <NavLink
              to="/profile"
              className="navbar-profile-link"
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={
                    user?.name ||
                    "Profile"
                  }
                  className="navbar-profile-image"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const fallback =
                      event.currentTarget
                        .nextElementSibling;

                    if (fallback) {
                      fallback.style.display =
                        "flex";
                    }
                  }}
                />
              ) : null}

              <span
                className="navbar-profile-fallback"
                style={{
                  display: profileImageUrl
                    ? "none"
                    : "flex",
                }}
              >
                {userInitial}
              </span>

              <span className="navbar-user-name">
                {user?.name || "User"}
              </span>
            </NavLink>

            <button
              type="button"
              className="btn btn-danger btn-sm navbar-logout-button"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right me-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;