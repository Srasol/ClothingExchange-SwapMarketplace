import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import getImageUrl from "../utils/imageUrl";

function AdminListings() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/listings");
      setListings(response.data?.listings || response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load listings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const categories = useMemo(
    () => [
      ...new Set(listings.map((item) => item.category).filter(Boolean)),
    ],
    [listings]
  );

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesSearch =
        !query ||
        [
          listing.title,
          listing.brand,
          listing.location,
          listing.owner?.name,
          listing.owner?.email,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      const matchesCategory =
        category === "all" || listing.category === category;

      const matchesStatus =
        status === "all" || listing.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [listings, search, category, status]);

  const deleteListing = async (listing) => {
    if (!window.confirm(`Delete "${listing.title}"?`)) {
      return;
    }

    try {
      setDeletingId(listing._id);
      setError("");
      setMessage("");

      await API.delete(`/admin/listings/${listing._id}`);

      setListings((current) =>
        current.filter((item) => item._id !== listing._id)
      );

      setMessage("Listing deleted successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete listing."
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="admin-page">
      <PageHeader
        title="Listings"
        description="Review and manage every clothing listing."
        count={`${listings.length} Listings`}
      />

      <Messages message={message} error={error} />

      <section className="admin-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title, brand, owner or location..."
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Swapped">Swapped</option>
        </select>

        <button type="button" onClick={loadListings}>
          Refresh
        </button>
      </section>

      {loading ? (
        <div className="admin-loading">Loading listings...</div>
      ) : filteredListings.length === 0 ? (
        <div className="admin-empty-text">No listings found.</div>
      ) : (
        <section className="admin-card-grid">
          {filteredListings.map((listing) => (
            <article className="admin-listing-card" key={listing._id}>
              <img
                src={getImageUrl(listing.image)}
                alt={listing.title || "Listing"}
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/600x450?text=No+Image";
                }}
              />

              <div className="admin-listing-card-body">
                <div className="admin-listing-card-title">
                  <div>
                    <h2>{listing.title || "Untitled listing"}</h2>
                    <p>
                      {listing.brand || "No brand"} ·{" "}
                      {listing.category || "Clothing"}
                    </p>
                  </div>

                  <span>{listing.status || "Available"}</span>
                </div>

                <div className="admin-listing-meta">
                  <p>
                    <strong>Owner:</strong>{" "}
                    {listing.owner?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {listing.location || "Not provided"}
                  </p>
                  <p>
                    <strong>Value:</strong> ₹
                    {Number(listing.estimatedValue || 0).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-danger-button full"
                  disabled={deletingId === listing._id}
                  onClick={() => deleteListing(listing)}
                >
                  {deletingId === listing._id
                    ? "Deleting..."
                    : "Delete Listing"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
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

export default AdminListings;