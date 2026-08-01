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

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:5000";

const getProfileImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${SERVER_URL}/${image.replace(/\\/g, "/")}`;
};

function UserLayout() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
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
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="user-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
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
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            <FaBars />
          </button>

          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
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
              title={collapsed ? item.label : ""}
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
                <img
                  src={getProfileImageUrl(
                    user.profileImage
                  )}
                  alt={user?.name || "Profile"}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>
                  {user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            <div className="sidebar-text">
              <strong>{user?.name || "User"}</strong>
              <small>{user?.email || ""}</small>
            </div>
          </div>

          <button
            type="button"
            className="user-logout-button"
            onClick={logout}
            title={collapsed ? "Logout" : ""}
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