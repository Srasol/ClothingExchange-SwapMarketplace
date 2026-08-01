import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const statuses = [
  "Pending",
  "Accepted",
  "Rejected",
  "Completed",
  "Cancelled",
];

function AdminSwaps() {
  const [swaps, setSwaps] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadSwaps = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/swaps");
      setSwaps(response.data?.swaps || response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load swaps."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSwaps();
  }, [loadSwaps]);

  const filteredSwaps = useMemo(() => {
    const query = search.trim().toLowerCase();

    return swaps.filter((swap) => {
      const matchesSearch =
        !query ||
        [
          swap.sender?.name,
          swap.receiver?.name,
          swap.offeredItem?.title,
          swap.requestedItem?.title,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "all" || swap.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [swaps, search, statusFilter]);

  const updateStatus = async (swapId, status) => {
    try {
      setBusyId(swapId);
      setError("");
      setMessage("");

      const response = await API.put(
        `/admin/swaps/${swapId}/status`,
        { status }
      );

      const updated = response.data?.swap || response.data;

      setSwaps((current) =>
        current.map((swap) =>
          swap._id === swapId
            ? { ...swap, ...updated, status: updated?.status || status }
            : swap
        )
      );

      setMessage("Swap status updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update swap status."
      );
    } finally {
      setBusyId("");
    }
  };

  const deleteSwap = async (swapId) => {
    if (!window.confirm("Delete this swap request?")) {
      return;
    }

    try {
      setBusyId(swapId);
      setError("");
      setMessage("");

      await API.delete(`/admin/swaps/${swapId}`);

      setSwaps((current) =>
        current.filter((swap) => swap._id !== swapId)
      );

      setMessage("Swap deleted successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete swap."
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="admin-page">
      <PageHeader
        title="Swaps"
        description="Review, update and remove swap requests."
        count={`${swaps.length} Swaps`}
      />

      <Messages message={message} error={error} />

      <section className="admin-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search sender, receiver or item..."
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button type="button" onClick={loadSwaps}>
          Refresh
        </button>
      </section>

      <section className="admin-panel">
        {loading ? (
          <div className="admin-loading">Loading swaps...</div>
        ) : filteredSwaps.length === 0 ? (
          <div className="admin-empty-text">No swaps found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Offered Item</th>
                  <th>Requested Item</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredSwaps.map((swap) => (
                  <tr key={swap._id}>
                    <td>{swap.sender?.name || "Unknown"}</td>
                    <td>{swap.receiver?.name || "Unknown"}</td>
                    <td>{swap.offeredItem?.title || "Deleted item"}</td>
                    <td>{swap.requestedItem?.title || "Deleted item"}</td>

                    <td>
                      <select
                        value={swap.status || "Pending"}
                        disabled={busyId === swap._id}
                        onChange={(event) =>
                          updateStatus(swap._id, event.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>{formatDate(swap.createdAt)}</td>

                    <td className="text-right">
                      <button
                        type="button"
                        className="admin-danger-button"
                        disabled={busyId === swap._id}
                        onClick={() => deleteSwap(swap._id)}
                      >
                        {busyId === swap._id ? "Working..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

function Messages({ message, error }) {
  return (
    <>
      {message && <div className="admin-alert success">{message}</div>}
      {error && <div className="admin-alert error">{error}</div>}
    </>
  );
}

function formatDate(date) {
  return date
    ? new Date(date).toLocaleDateString("en-IN")
    : "Not available";
}

export default AdminSwaps;