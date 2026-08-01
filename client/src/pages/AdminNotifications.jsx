import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/notifications");
      setNotifications(
        response.data?.notifications || response.data || []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((item) =>
      String(item.message || item.title || "")
        .toLowerCase()
        .includes(query)
    );
  }, [notifications, search]);

  return (
    <main className="admin-page">
      <PageHeader
        title="Notifications"
        description="Review platform notifications and activity alerts."
        count={`${notifications.length} Notifications`}
      />

      {error && <div className="admin-alert error">{error}</div>}

      <section className="admin-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search notifications..."
        />

        <button type="button" onClick={loadNotifications}>
          Refresh
        </button>
      </section>

      <section className="admin-panel">
        {loading ? (
          <div className="admin-loading">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-text">No notifications found.</div>
        ) : (
          <div className="admin-notification-list">
            {filtered.map((item) => (
              <article key={item._id}>
                <div>
                  <strong>{item.title || "Notification"}</strong>
                  <p>{item.message || "No message"}</p>
                </div>

                <span>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString("en-IN")
                    : ""}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function PageHeader({ title, description, count }) {
  return (
    <header className="admin-page-header-row">
      <div>
        <span>Admin management</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <strong>{count}</strong>
    </header>
  );
}

export default AdminNotifications;