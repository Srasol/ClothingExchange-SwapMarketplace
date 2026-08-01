import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  FaBell,
  FaChartBar,
  FaCog,
  FaExchangeAlt,
  FaFileAlt,
  FaHome,
  FaList,
  FaSignOutAlt,
  FaStar,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

function AdminSidebar({
  mobileOpen,
  closeMobile,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaHome />,
      end: true,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <FaUsers />,
    },
    {
      name: "Listings",
      path: "/admin/listings",
      icon: <FaList />,
    },
    {
      name: "Swaps",
      path: "/admin/swaps",
      icon: <FaExchangeAlt />,
    },
    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: <FaStar />,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <FaChartBar />,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: <FaBell />,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: <FaFileAlt />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FaCog />,
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const getLinkClass = ({ isActive }) =>
    `admin-nav-link ${
      isActive ? "active" : ""
    }`;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={closeMobile}
          aria-label="Close admin menu"
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">
            <FaExchangeAlt />
          </span>

          <div>
            <strong>SwapStyle</strong>
            <small>Admin Panel</small>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMobile}
            aria-label="Close admin menu"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={getLinkClass}
              onClick={closeMobile}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-user-dashboard-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            User Dashboard
          </button>

          <button
            type="button"
            className="admin-logout-button"
            onClick={logout}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;