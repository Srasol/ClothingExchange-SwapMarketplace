import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/analytics");
      setAnalytics(response.data || {});
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return <div className="admin-loading">Loading analytics...</div>;
  }

  const entries = Object.entries(analytics).filter(
    ([, value]) =>
      typeof value === "number" || typeof value === "string"
  );

  return (
    <main className="admin-page">
      <PageHeader
        title="Analytics"
        description="View platform activity and performance metrics."
      />

      {error && <div className="admin-alert error">{error}</div>}

      <section className="admin-stat-grid">
        {entries.length === 0 ? (
          <div className="admin-empty-text">
            No analytics data available.
          </div>
        ) : (
          entries.map(([key, value]) => (
            <article className="admin-stat-card" key={key}>
              <div>
                <span>{formatLabel(key)}</span>
                <strong>{value}</strong>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function PageHeader({ title, description }) {
  return (
    <header className="admin-page-header">
      <span>Admin insights</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default AdminAnalytics;