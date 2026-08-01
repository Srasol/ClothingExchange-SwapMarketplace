import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/reports");
      const data = response.data;

      if (Array.isArray(data)) {
        setReports(data);
        setSummary({});
        return;
      }

      if (Array.isArray(data?.reports)) {
        setReports(data.reports);
        setSummary(
          data.summary && typeof data.summary === "object"
            ? data.summary
            : {}
        );
        return;
      }

      setReports([]);
      setSummary(
        data && typeof data === "object"
          ? data
          : {}
      );
    } catch (requestError) {
      console.error(
        "Load admin reports error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load reports."
      );

      setReports([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const summaryEntries = Object.entries(summary).filter(
    ([key, value]) =>
      key !== "message" &&
      key !== "reports" &&
      (
        typeof value === "number" ||
        typeof value === "string"
      )
  );

  return (
    <main className="admin-page">
      <header className="admin-page-header-row">
        <div>
          <span>Admin Management</span>

          <h1>Reports</h1>

          <p>
            Review generated reports and platform summaries.
          </p>
        </div>

        <strong>
          {reports.length} Reports
        </strong>
      </header>

      {error && (
        <div className="admin-alert error">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadReports}
          >
            Retry
          </button>
        </div>
      )}

      {summaryEntries.length > 0 && (
        <section className="admin-stat-grid">
          {summaryEntries.map(([key, value]) => (
            <article
              className="admin-stat-card"
              key={key}
            >
              <div>
                <span>
                  {formatLabel(key)}
                </span>

                <strong>{value}</strong>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Generated Reports</h2>

            <p>
              Available administrative reports and summaries.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />

            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="admin-empty-text">
            No reports found.
          </div>
        ) : (
          <div className="admin-simple-list">
            {reports.map((report, index) => (
              <div
                key={
                  report?._id ||
                  report?.id ||
                  `report-${index}`
                }
              >
                <div>
                  <strong>
                    {report?.title ||
                      report?.name ||
                      `Report ${index + 1}`}
                  </strong>

                  <span>
                    {report?.description ||
                      report?.status ||
                      "Report available"}
                  </span>
                </div>

                <span>
                  {formatDate(
                    report?.createdAt ||
                      report?.generatedAt
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function formatLabel(value) {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default AdminReports;