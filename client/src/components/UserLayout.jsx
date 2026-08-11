import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  FaBars,
  FaComments,
  FaExchangeAlt,
  FaHeart,
  FaHome,
  FaList,
  FaPlus,
  FaSignOutAlt,
  FaSyncAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import "./UserLayout.css";
import { getImageUrl } from "../utils/imageUrl";

function UserLayout() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "sidebarCollapsed",
      String(collapsed)
    );
  }, [collapsed]);

  useEffect(() => {
    const updateSidebarUser = () => {
      try {
        const updatedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );
        setUser(updatedUser);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener(
      "profileUpdated",
      updateSidebarUser
    );

    window.addEventListener(
      "storage",
      updateSidebarUser
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        updateSidebarUser
      );

      window.removeEventListener(
        "storage",
        updateSidebarUser
      );
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getLinkClass = ({ isActive }) =>
    `user-layout-link ${isActive ? "active" : ""}`;

  const menuItems = [
    {
      to: "/dashboard",
      icon: <FaHome />,
      label: "Dashboard",
    },
    {
      to: "/listings",
      icon: <FaList />,
      label: "Marketplace",
    },
    {
      to: "/add-listing",
      icon: <FaPlus />,
      label: "Add Listing",
    },
    {
      to: "/swap-requests",
      icon: <FaSyncAlt />,
      label: "Swap Requests",
    },
    {
      to: "/chat",
      icon: <FaComments />,
      label: "Chat",
    },
    {
      to: "/wishlist",
      icon: <FaHeart />,
      label: "Wishlist",
    },
    {
      to: "/profile",
      icon: <FaUser />,
      label: "Profile",
    },
  ];

  return (
    <div
      className={`user-layout ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <button
        type="button"
        className="mobile-sidebar-button"
        onClick={() => setMobileOpen(true)}
      >
        <FaBars />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="user-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`user-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="user-sidebar-top">
          <div className="user-sidebar-brand">
            <span className="user-sidebar-logo">
              <FaExchangeAlt />
            </span>

            <div className="sidebar-text">
              <strong>SwapStyle</strong>
              <small>Clothing Exchange</small>
            </div>
          </div>

          <button
            type="button"
            className="desktop-sidebar-toggle"
            onClick={() =>
              setCollapsed((current) => !current)
            }
          >
            <FaBars />
          </button>

          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() => setMobileOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="user-sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={getLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              <span className="user-link-icon">
                {item.icon}
              </span>

              <span className="sidebar-text">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="user-sidebar-footer">
          <div className="user-profile-summary">
            <div className="user-profile-avatar">
              {user?.profileImage ? (
                <>
                  <img
                    src={getImageUrl(
                      user.profileImage
                    )}
                    alt={
                      user?.name || "Profile"
                    }
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";

                      if (
                        e.currentTarget
                          .nextElementSibling
                      ) {
                        e.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }
                    }}
                  />

                  <span
                    style={{
                      display: "none",
                    }}
                  >
                    {user?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </span>
                </>
              ) : (
                <span>
                  {user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            <div className="sidebar-text">
              <strong>
                {user?.name || "User"}
              </strong>

              <small>
                {user?.email || ""}
              </small>
            </div>
          </div>

          <button
            type="button"
            className="user-logout-button"
            onClick={logout}
          >
            <FaSignOutAlt />

            <span className="sidebar-text">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className="user-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;