import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaExchangeAlt,
  FaHourglassHalf,
  FaList,
  FaRedoAlt,
  FaStar,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";

import API from "../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/dashboard");

      setDashboard(response.data || {});
    } catch (requestError) {
      console.error(
        "Load admin dashboard error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load the admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = dashboard?.stats || dashboard || {};

  const recentUsers = Array.isArray(
    dashboard?.recentUsers
  )
    ? dashboard.recentUsers
    : [];

  const recentListings = Array.isArray(
    dashboard?.recentListings
  )
    ? dashboard.recentListings
    : [];

  const recentSwaps = Array.isArray(
    dashboard?.recentSwaps
  )
    ? dashboard.recentSwaps
    : [];

  const cards = useMemo(
    () => [
      {
        title: "Total Users",
        value: stats.totalUsers || 0,
        description: "Registered members",
        icon: <FaUsers />,
        className: "users",
      },
      {
        title: "Total Listings",
        value: stats.totalListings || 0,
        description: "Clothing items",
        icon: <FaList />,
        className: "listings",
      },
      {
        title: "Total Swaps",
        value: stats.totalSwaps || 0,
        description: "All swap requests",
        icon: <FaExchangeAlt />,
        className: "swaps",
      },
      {
        title: "Pending Swaps",
        value: stats.pendingSwaps || 0,
        description: "Waiting for action",
        icon: <FaHourglassHalf />,
        className: "pending",
      },
      {
        title: "Accepted Swaps",
        value: stats.acceptedSwaps || 0,
        description: "Approved exchanges",
        icon: <FaCheckCircle />,
        className: "accepted",
      },
      {
        title: "Completed Swaps",
        value: stats.completedSwaps || 0,
        description: "Successful exchanges",
        icon: <FaStar />,
        className: "completed",
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <main className="admin-dashboard-theme-page">
        <div className="admin-dashboard-theme-loading">
          <div className="admin-dashboard-theme-spinner" />

          <h2>Loading Dashboard</h2>

          <p>
            Preparing your marketplace overview.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-theme-page">
      <section className="admin-dashboard-theme-hero">
        <div className="admin-dashboard-theme-hero-content">
          <span className="admin-dashboard-theme-eyebrow">
            Admin Overview
          </span>

          <h1>
            Welcome to your
            <span> marketplace dashboard.</span>
          </h1>

          <p>
            Monitor users, clothing listings, swap activity
            and recent marketplace updates from one place.
          </p>

          <div className="admin-dashboard-theme-actions">
            <Link
              to="/admin/listings"
              className="admin-dashboard-theme-primary-button"
            >
              Manage Listings
              <FaArrowRight />
            </Link>

            <button
              type="button"
              className="admin-dashboard-theme-refresh-button"
              onClick={loadDashboard}
            >
              <FaRedoAlt />
              Refresh Data
            </button>
          </div>
        </div>

        <div className="admin-dashboard-theme-hero-summary">
          <div className="admin-dashboard-theme-summary-icon">
            <FaExchangeAlt />
          </div>

          <div>
            <span>Total Marketplace Activity</span>

            <strong>
              {(stats.totalUsers || 0) +
                (stats.totalListings || 0) +
                (stats.totalSwaps || 0)}
            </strong>

            <p>
              Users, listings and swaps combined
            </p>
          </div>
        </div>
      </section>

      {error && (
        <section className="admin-dashboard-theme-error">
          <div>
            <strong>Dashboard error</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </section>
      )}

      <section className="admin-dashboard-theme-stat-grid">
        {cards.map((card) => (
          <article
            key={card.title}
            className={`admin-dashboard-theme-stat-card ${card.className}`}
          >
            <div className="admin-dashboard-theme-stat-copy">
              <span>{card.title}</span>

              <strong>{card.value}</strong>

              <p>{card.description}</p>
            </div>

            <div className="admin-dashboard-theme-stat-icon">
              {card.icon}
            </div>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-theme-overview">
        <div className="admin-dashboard-theme-section-heading">
          <div>
            <span>Swap Performance</span>

            <h2>Swap Overview</h2>

            <p>
              Current status of all marketplace swap requests.
            </p>
          </div>

          <Link to="/admin/swaps">
            View All Swaps
            <FaArrowRight />
          </Link>
        </div>

        <div className="admin-dashboard-theme-status-grid">
          <StatusCard
            label="Pending"
            value={stats.pendingSwaps || 0}
            icon={<FaHourglassHalf />}
            className="pending"
          />

          <StatusCard
            label="Accepted"
            value={stats.acceptedSwaps || 0}
            icon={<FaCheckCircle />}
            className="accepted"
          />

          <StatusCard
            label="Rejected"
            value={stats.rejectedSwaps || 0}
            icon={<FaTimesCircle />}
            className="rejected"
          />

          <StatusCard
            label="Completed"
            value={stats.completedSwaps || 0}
            icon={<FaStar />}
            className="completed"
          />
        </div>
      </section>

      <section className="admin-dashboard-theme-content-grid">
        <RecentPanel
          label="Community"
          title="Recent Users"
          description="Newest registered marketplace members."
          link="/admin/users"
          linkText="Manage Users"
          emptyText="No recent users available."
        >
          {recentUsers.map((user) => (
            <RecentUser
              key={user._id}
              user={user}
            />
          ))}
        </RecentPanel>

        <RecentPanel
          label="Marketplace"
          title="Recent Listings"
          description="Latest clothing added to the platform."
          link="/admin/listings"
          linkText="Manage Listings"
          emptyText="No recent listings available."
        >
          {recentListings.map((listing) => (
            <RecentListing
              key={listing._id}
              listing={listing}
            />
          ))}
        </RecentPanel>
      </section>

      <RecentPanel
        label="Exchange Activity"
        title="Recent Swap Requests"
        description="Latest swap requests made by users."
        link="/admin/swaps"
        linkText="Manage Swaps"
        emptyText="No recent swap requests available."
        fullWidth
      >
        {recentSwaps.map((swap) => (
          <RecentSwap
            key={swap._id}
            swap={swap}
          />
        ))}
      </RecentPanel>
    </main>
  );
}

function StatusCard({
  label,
  value,
  icon,
  className,
}) {
  return (
    <article
      className={`admin-dashboard-theme-status-card ${className}`}
    >
      <div className="admin-dashboard-theme-status-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function RecentPanel({
  label,
  title,
  description,
  link,
  linkText,
  emptyText,
  children,
  fullWidth = false,
}) {
  const items = Array.isArray(children)
    ? children.filter(Boolean)
    : children
    ? [children]
    : [];

  return (
    <section
      className={`admin-dashboard-theme-panel ${
        fullWidth ? "full-width" : ""
      }`}
    >
      <div className="admin-dashboard-theme-panel-heading">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <Link to={link}>
          {linkText}
          <FaArrowRight />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="admin-dashboard-theme-empty">
          {emptyText}
        </div>
      ) : (
        <div className="admin-dashboard-theme-recent-list">
          {items}
        </div>
      )}
    </section>
  );
}

function RecentUser({ user }) {
  const firstLetter =
    user.name?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <article className="admin-dashboard-theme-recent-item">
      <div className="admin-dashboard-theme-user-avatar">
        {firstLetter}
      </div>

      <div className="admin-dashboard-theme-recent-copy">
        <strong>
          {user.name || "Unknown user"}
        </strong>

        <span>
          {user.email || "Email not provided"}
        </span>
      </div>

      <small>
        {formatDate(user.createdAt)}
      </small>
    </article>
  );
}

function RecentListing({ listing }) {
  return (
    <article className="admin-dashboard-theme-recent-item">
      <div className="admin-dashboard-theme-listing-icon">
        <FaList />
      </div>

      <div className="admin-dashboard-theme-recent-copy">
        <strong>
          {listing.title || "Untitled listing"}
        </strong>

        <span>
          {listing.owner?.name ||
            listing.location ||
            "Owner unavailable"}
        </span>
      </div>

      <small>
        ₹
        {Number(
          listing.estimatedValue || 0
        ).toLocaleString("en-IN")}
      </small>
    </article>
  );
}

function RecentSwap({ swap }) {
  return (
    <article className="admin-dashboard-theme-recent-item swap-item">
      <div className="admin-dashboard-theme-swap-icon">
        <FaExchangeAlt />
      </div>

      <div className="admin-dashboard-theme-recent-copy">
        <strong>
          {swap.sender?.name || "Unknown"} requested a
          swap with{" "}
          {swap.receiver?.name || "Unknown"}
        </strong>

        <span>
          {swap.requestedItem?.title ||
            "Requested item unavailable"}
        </span>
      </div>

      <div className="admin-dashboard-theme-swap-meta">
        <span
          className={`admin-dashboard-theme-status-badge ${String(
            swap.status || "Pending"
          ).toLowerCase()}`}
        >
          {swap.status || "Pending"}
        </span>

        <small>
          {formatDate(swap.createdAt)}
        </small>
      </div>
    </article>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default AdminDashboard;