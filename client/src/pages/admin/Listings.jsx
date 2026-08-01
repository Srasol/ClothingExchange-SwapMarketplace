import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const SERVER_URL = "http://localhost:5000";

function Listings() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadListings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/listings");

      setListings(
        Array.isArray(response.data)
          ? response.data
          : response.data?.listings || []
      );
    } catch (err) {
      console.error("Load listings error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `${SERVER_URL}${
      imagePath.startsWith("/")
        ? imagePath
        : `/${imagePath}`
    }`;
  };

  const filteredListings = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return listings;
    }

    return listings.filter((listing) => {
      return (
        listing.title?.toLowerCase().includes(value) ||
        listing.brand?.toLowerCase().includes(value) ||
        listing.category?.toLowerCase().includes(value) ||
        listing.size?.toLowerCase().includes(value) ||
        listing.condition?.toLowerCase().includes(value) ||
        listing.location?.toLowerCase().includes(value) ||
        listing.status?.toLowerCase().includes(value) ||
        listing.owner?.name?.toLowerCase().includes(value) ||
        listing.owner?.email?.toLowerCase().includes(value)
      );
    });
  }, [listings, search]);

  const deleteListing = async (listing) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(listing._id);
      setError("");
      setSuccess("");

      const response = await API.delete(
        `/admin/listings/${listing._id}`
      );

      setListings((previousListings) =>
        previousListings.filter(
          (item) => item._id !== listing._id
        )
      );

      setSuccess(
        response.data?.message ||
          "Listing deleted successfully."
      );
    } catch (err) {
      console.error("Delete listing error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete listing."
      );
    } finally {
      setDeletingId("");
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
              className="list-group-item list-group-item-action active"
            >
              Listings
            </Link>

            <Link
              to="/admin/swaps"
              className="list-group-item list-group-item-action"
            >
              Swaps
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                Manage Listings
              </h2>

              <p className="text-muted mb-0">
                View, search and delete clothing listings.
              </p>
            </div>

            <span className="badge bg-success fs-6">
              Total: {listings.length}
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
                    placeholder="Search by title, owner, category, brand, location or status"
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
                    onClick={loadListings}
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
                    Loading listings...
                  </p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="alert alert-info mb-0">
                  No listings found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Image</th>
                        <th>Listing</th>
                        <th>Owner</th>
                        <th>Details</th>
                        <th>Value</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredListings.map(
                        (listing, index) => (
                          <tr key={listing._id}>
                            <td>{index + 1}</td>

                            <td>
                              {listing.image ? (
                                <img
                                  src={getImageUrl(
                                    listing.image
                                  )}
                                  alt={listing.title}
                                  className="rounded border"
                                  style={{
                                    width: "75px",
                                    height: "75px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="bg-light border rounded d-flex justify-content-center align-items-center text-muted"
                                  style={{
                                    width: "75px",
                                    height: "75px",
                                  }}
                                >
                                  No image
                                </div>
                              )}
                            </td>

                            <td>
                              <strong>
                                {listing.title}
                              </strong>

                              <div className="text-muted">
                                {listing.brand ||
                                  "No brand"}
                              </div>

                              <small className="text-muted">
                                {listing.createdAt
                                  ? new Date(
                                      listing.createdAt
                                    ).toLocaleDateString()
                                  : ""}
                              </small>
                            </td>

                            <td>
                              <div>
                                {listing.owner?.name?.trim() ||
                                  "Unknown owner"}
                              </div>

                              <small className="text-muted">
                                {listing.owner?.email ||
                                  "No email"}
                              </small>
                            </td>

                            <td>
                              <div>
                                <strong>Category:</strong>{" "}
                                {listing.category ||
                                  "Not specified"}
                              </div>

                              <div>
                                <strong>Size:</strong>{" "}
                                {listing.size ||
                                  "Not specified"}
                              </div>

                              <div>
                                <strong>Condition:</strong>{" "}
                                {listing.condition ||
                                  "Not specified"}
                              </div>
                            </td>

                            <td>
                              ₹
                              {listing.estimatedValue ??
                                0}
                            </td>

                            <td>
                              {listing.location ||
                                "Not specified"}
                            </td>

                            <td>
                              <span
                                className={`badge ${
                                  listing.status ===
                                  "Available"
                                    ? "bg-success"
                                    : listing.status ===
                                        "Swapped"
                                      ? "bg-secondary"
                                      : "bg-warning text-dark"
                                }`}
                              >
                                {listing.status ||
                                  "Unknown"}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  deleteListing(listing)
                                }
                                disabled={
                                  deletingId ===
                                  listing._id
                                }
                              >
                                {deletingId ===
                                listing._id
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

export default Listings;