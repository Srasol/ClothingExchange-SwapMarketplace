import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalSwaps: 0,
    pendingSwaps: 0,
    acceptedSwaps: 0,
    rejectedSwaps: 0,
    completedSwaps: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/dashboard");

      setDashboard(response.data?.stats || {});
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await API.get("/notifications");

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : response.data?.notifications || []
      );
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    loadDashboard();
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const dashboardCards = [
    {
      title: "Total Users",
      value: dashboard.totalUsers || 0,
      icon: "👥",
      className: "border-primary",
    },
    {
      title: "Total Listings",
      value: dashboard.totalListings || 0,
      icon: "👕",
      className: "border-success",
    },
    {
      title: "Total Swaps",
      value: dashboard.totalSwaps || 0,
      icon: "🔄",
      className: "border-warning",
    },
    {
      title: "Pending Swaps",
      value: dashboard.pendingSwaps || 0,
      icon: "⏳",
      className: "border-warning",
    },
    {
      title: "Accepted Swaps",
      value: dashboard.acceptedSwaps || 0,
      icon: "✅",
      className: "border-primary",
    },
    {
      title: "Rejected Swaps",
      value: dashboard.rejectedSwaps || 0,
      icon: "❌",
      className: "border-danger",
    },
    {
      title: "Completed Swaps",
      value: dashboard.completedSwaps || 0,
      icon: "🏁",
      className: "border-success",
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 bg-dark text-white min-vh-100 p-3">
          <h3 className="text-center mb-4">Admin</h3>

          <div className="list-group">
            <Link
              to="/admin"
              className="list-group-item list-group-item-action active"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              className="list-group-item list-group-item-action"
            >
              Users
            </Link>

            <Link
              to="/admin/listings"
              className="list-group-item list-group-item-action"
            >
              Listings
            </Link>

            <Link
              to="/admin/swaps"
              className="list-group-item list-group-item-action"
            >
              Swaps
            </Link>

            <Link
              to="/chat"
              className="list-group-item list-group-item-action"
            >
              Chat
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="col-md-10 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-1">Admin Dashboard</h1>

              <p className="text-muted mb-0">
                View marketplace statistics and manage the application.
              </p>
            </div>

            <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
              <button
                type="button"
                className="btn btn-light position-relative"
                onClick={loadNotifications}
              >
                🔔

                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={loadDashboard}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              />

              <p className="mt-3">Loading dashboard...</p>
            </div>
          ) : (
            <div className="row g-3 mb-4">
              {dashboardCards.map((card) => (
                <div
                  className="col-sm-6 col-md-4 col-xl-3"
                  key={card.title}
                >
                  <div
                    className={`card h-100 shadow-sm border-0 border-start border-4 ${card.className}`}
                  >
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted mb-1">
                          {card.title}
                        </p>

                        <h2 className="mb-0">
                          {card.value}
                        </h2>
                      </div>

                      <div className="fs-2">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="d-flex gap-3 flex-wrap mb-4">
            <Link
              to="/admin/users"
              className="btn btn-primary"
            >
              Manage Users
            </Link>

            <Link
              to="/admin/listings"
              className="btn btn-success"
            >
              Manage Listings
            </Link>

            <Link
              to="/admin/swaps"
              className="btn btn-warning"
            >
              Manage Swaps
            </Link>

            <Link
              to="/chat"
              className="btn btn-info text-white"
            >
              Open Chat
            </Link>
          </div>

          <div className="card shadow-sm">
            <div className="card-header">
              <strong>🔔 Notifications</strong>
            </div>

            <div
              className="card-body"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {notifications.length === 0 ? (
                <p className="text-muted mb-0">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border-bottom pb-2 mb-2 ${
                      notification.isRead ? "" : "fw-bold"
                    }`}
                  >
                    <div>{notification.message}</div>

                    <small className="text-muted">
                      {notification.createdAt
                        ? new Date(
                            notification.createdAt
                          ).toLocaleString()
                        : ""}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;