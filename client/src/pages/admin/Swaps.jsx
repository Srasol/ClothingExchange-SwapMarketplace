import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

function Swaps() {
  const [swaps, setSwaps] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadSwaps = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/swaps");

      setSwaps(
        Array.isArray(response.data)
          ? response.data
          : response.data.swaps || []
      );
    } catch (err) {
      console.error("Load swaps error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load swap requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwaps();
  }, []);

  const filteredSwaps = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return swaps;
    }

    return swaps.filter((swap) => {
      return (
        swap.sender?.name
          ?.toLowerCase()
          .includes(value) ||
        swap.sender?.email
          ?.toLowerCase()
          .includes(value) ||
        swap.receiver?.name
          ?.toLowerCase()
          .includes(value) ||
        swap.receiver?.email
          ?.toLowerCase()
          .includes(value) ||
        swap.offeredItem?.title
          ?.toLowerCase()
          .includes(value) ||
        swap.requestedItem?.title
          ?.toLowerCase()
          .includes(value) ||
        swap.status
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [swaps, search]);

  const deleteSwap = async (swap) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this swap request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(swap._id);
      setError("");
      setSuccess("");

      const response = await API.delete(
        `/admin/swaps/${swap._id}`
      );

      setSwaps((previousSwaps) =>
        previousSwaps.filter(
          (item) => item._id !== swap._id
        )
      );

      setSuccess(
        response.data?.message ||
          "Swap request deleted successfully."
      );
    } catch (err) {
      console.error("Delete swap error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete swap request."
      );
    } finally {
      setDeletingId("");
    }
  };
  const updateStatus = async (swapId, newStatus) => {
    try {
    setUpdatingId(swapId);
    setError("");
    setSuccess("");

    const response = await API.put(
      `/admin/swaps/${swapId}/status`,
      {
        status: newStatus,
      }
    );

    const updatedSwap =
      response.data.swap || response.data;

    setSwaps((previousSwaps) =>
      previousSwaps.map((swap) =>
        swap._id === swapId
          ? {
              ...swap,
              ...updatedSwap,
              status:
                updatedSwap.status || newStatus,
            }
          : swap
      )
    );

    setSuccess(
      response.data.message ||
        "Swap status updated successfully."
    );
  } catch (err) {
    console.error("Update swap status error:", err);

    setError(
      err.response?.data?.message ||
        "Failed to update swap status."
    );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 bg-dark text-white min-vh-100 p-3">
          <h3 className="text-center mb-4">
            Admin
          </h3>

          <div className="list-group">
            <Link
              to="/admin"
              className="list-group-item list-group-item-action"
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
              className="list-group-item list-group-item-action active"
            >
              Swaps
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                Manage Swap Requests
              </h2>

              <p className="text-muted mb-0">
                View, search and delete swap requests.
              </p>
            </div>

            <span className="badge bg-warning text-dark fs-6">
              Total: {swaps.length}
            </span>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-7">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by sender, receiver, item or status"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </div>

                <div className="col-md-5 text-md-end mt-2 mt-md-0">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadSwaps}
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  />

                  <p className="mt-2 mb-0">
                    Loading swap requests...
                  </p>
                </div>
              ) : filteredSwaps.length === 0 ? (
                <div className="alert alert-info mb-0">
                  No swap requests found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Sender</th>
                        <th>Receiver</th>
                        <th>Offered Item</th>
                        <th>Requested Item</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSwaps.map(
                        (swap, index) => (
                          <tr key={swap._id}>
                            <td>{index + 1}</td>

                            <td>
                              <strong>
                                {swap.sender?.name?.trim() ||
                                  "Unknown"}
                              </strong>

                              <div>
                                <small className="text-muted">
                                  {swap.sender?.email ||
                                    "No email"}
                                </small>
                              </div>
                            </td>

                            <td>
                              <strong>
                                {swap.receiver?.name?.trim() ||
                                  "Unknown"}
                              </strong>

                              <div>
                                <small className="text-muted">
                                  {swap.receiver?.email ||
                                    "No email"}
                                </small>
                              </div>
                            </td>

                            <td>
                              {swap.offeredItem?.title ||
                                "Deleted item"}

                              {swap.offeredItem?.brand && (
                                <div>
                                  <small className="text-muted">
                                    {swap.offeredItem.brand}
                                  </small>
                                </div>
                              )}
                            </td>

                            <td>
                              {swap.requestedItem?.title ||
                                "Deleted item"}

                              {swap.requestedItem?.brand && (
                                <div>
                                  <small className="text-muted">
                                    {swap.requestedItem.brand}
                                  </small>
                                </div>
                              )}
                            </td>

                            <td>
                              {swap.message ||
                                "No message"}
                            </td>

                            <td style={{ minWidth: "160px" }}>
                              <select
                                className="form-select form-select-sm"
                                value={swap.status || "Pending"}
                                disabled={updatingId === swap._id}
                                onChange={(event) =>
                                  updateStatus(
                                    swap._id,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Completed">Completed</option>
                              </select>

                              {updatingId === swap._id && (
                                <small className="text-muted">
                                  Updating...
                                </small>
                              )}
                            </td>

                            <td>
                              {swap.createdAt
                                ? new Date(
                                    swap.createdAt
                                  ).toLocaleDateString()
                                : "Unknown"}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  deleteSwap(swap)
                                }
                                disabled={
                                  deletingId ===
                                  swap._id
                                }
                              >
                                {deletingId ===
                                swap._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Swaps;