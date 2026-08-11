import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBoxOpen,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaTshirt,
} from "react-icons/fa";

import API from "../services/api";
import "../styles/listings.css";
import {
  getImageUrl,
} from "../utils/imageUrl";

function MyListings() {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const userId = storedUser._id || storedUser.id;

  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/listings");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.listings || [];

      const ownedListings = data.filter((listing) => {
        const ownerId =
          typeof listing.owner === "object"
            ? listing.owner?._id
            : listing.owner;

        return String(ownerId) === String(userId);
      });

      setListings(ownedListings);
    } catch (requestError) {
      console.error(
        "Load my listings error:",
        requestError.response?.data || requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load your listings."
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        listings
          .map((listing) => listing.category)
          .filter(Boolean)
      ),
    ];
  }, [listings]);

  const filteredListings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = listings.filter((listing) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          listing.title,
          listing.brand,
          listing.category,
          listing.location,
          listing.condition,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesCategory =
        category === "All" || listing.category === category;

      const listingStatus = listing.status || "Available";
      const matchesStatus =
        status === "All" ||
        String(listingStatus).toLowerCase() ===
          status.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
        );
      }

      if (sort === "value-low-high") {
        return (
          Number(a.estimatedValue || 0) -
          Number(b.estimatedValue || 0)
        );
      }

      if (sort === "value-high-low") {
        return (
          Number(b.estimatedValue || 0) -
          Number(a.estimatedValue || 0)
        );
      }

      if (sort === "title-a-z") {
        return String(a.title || "").localeCompare(
          String(b.title || "")
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });
  }, [listings, search, category, status, sort]);

  const availableCount = listings.filter(
    (listing) =>
      String(listing.status || "Available").toLowerCase() ===
      "available"
  ).length;

  const swappedCount = listings.filter(
    (listing) =>
      String(listing.status || "").toLowerCase() === "swapped"
  ).length;

  const unavailableCount = listings.filter(
    (listing) =>
      !["available", "swapped"].includes(
        String(listing.status || "Available").toLowerCase()
      )
  ).length;

  const deleteListing = async (listingId) => {
    const confirmed = window.confirm(
      "Delete this listing permanently?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(listingId);
      await API.delete(`/listings/${listingId}`);

      setListings((previous) =>
        previous.filter((listing) => listing._id !== listingId)
      );
    } catch (requestError) {
      alert(
        requestError.response?.data?.message ||
          "Unable to delete the listing."
      );
    } finally {
      setDeletingId("");
    }
  };

  const toggleListingStatus = async (listing) => {
    const currentStatus = String(
      listing.status || "Available"
    ).toLowerCase();

    const nextStatus =
      currentStatus === "available" ? "Swapped" : "Available";

    try {
      setUpdatingId(listing._id);

      const response = await API.put(
        `/listings/${listing._id}`,
        {
          status: nextStatus,
        }
      );

      const updatedListing =
        response.data?.listing || response.data;

      setListings((previous) =>
        previous.map((item) =>
          item._id === listing._id
            ? {
                ...item,
                ...updatedListing,
                status:
                  updatedListing?.status || nextStatus,
              }
            : item
        )
      );
    } catch (requestError) {
      alert(
        requestError.response?.data?.message ||
          "Unable to update listing status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStatus("All");
    setSort("newest");
  };

  return (
    <main className="my-listings-page">
      <section className="my-listings-hero">
        <div>
          <span>WARDROBE MANAGEMENT</span>
          <h1>My Listings</h1>
          <p>
            Manage every item you have shared, update availability
            and keep your exchange wardrobe organised.
          </p>
        </div>

        <Link to="/add-listing">
          <FaPlus />
          Add new listing
        </Link>
      </section>

      <section className="my-listings-summary">
        <SummaryCard
          title="Total Listings"
          value={listings.length}
          icon={<FaTshirt />}
          loading={loading}
        />

        <SummaryCard
          title="Available"
          value={availableCount}
          icon={<FaCheckCircle />}
          loading={loading}
        />

        <SummaryCard
          title="Swapped"
          value={swappedCount}
          icon={<FaSyncAlt />}
          loading={loading}
        />

        <SummaryCard
          title="Other Status"
          value={unavailableCount}
          icon={<FaBoxOpen />}
          loading={loading}
        />
      </section>

      <section className="my-listings-controls">
        <div className="my-listings-search">
          <FaSearch />

          <input
            type="search"
            placeholder="Search title, brand, category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All categories" : item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Available">Available</option>
          <option value="Swapped">Swapped</option>
          <option value="Pending">Pending</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="value-low-high">
            Value: low to high
          </option>
          <option value="value-high-low">
            Value: high to low
          </option>
          <option value="title-a-z">Title: A to Z</option>
        </select>
      </section>

      <section className="my-listings-heading">
        <div>
          <span>YOUR WARDROBE</span>
          <h2>
            {loading
              ? "Loading listings"
              : `${filteredListings.length} ${
                  filteredListings.length === 1
                    ? "listing"
                    : "listings"
                }`}
          </h2>
        </div>

        {(search ||
          category !== "All" ||
          status !== "All" ||
          sort !== "newest") && (
          <button type="button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </section>

      {error && (
        <div className="my-listings-error">
          <div>
            <strong>Unable to load listings</strong>
            <p>{error}</p>
          </div>

          <button type="button" onClick={loadListings}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="my-listings-grid">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="my-listing-skeleton"
              key={item}
            />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <section className="my-listings-empty">
          <span>
            <FaBoxOpen />
          </span>

          <h2>
            {listings.length === 0
              ? "Your wardrobe is empty"
              : "No matching listings"}
          </h2>

          <p>
            {listings.length === 0
              ? "Create your first listing and start exchanging clothes with the community."
              : "Change your filters or search phrase to find another listing."}
          </p>

          {listings.length === 0 ? (
            <Link to="/add-listing">
              <FaPlus />
              Add your first listing
            </Link>
          ) : (
            <button type="button" onClick={clearFilters}>
              Reset filters
            </button>
          )}
        </section>
      ) : (
        <section className="my-listings-grid">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              imageUrl={getImageUrl(listing.image)}
              deleting={deletingId === listing._id}
              updating={updatingId === listing._id}
              onDelete={() => deleteListing(listing._id)}
              onStatusChange={() =>
                toggleListingStatus(listing)
              }
            />
          ))}
        </section>
      )}

      <section className="my-listings-cta">
        <div>
          <span>READY TO SWAP MORE?</span>
          <h2>Share another item from your wardrobe.</h2>
        </div>

        <Link to="/add-listing">
          Add listing
          <FaArrowRight />
        </Link>
      </section>
    </main>
  );
}

function SummaryCard({ title, value, icon, loading }) {
  return (
    <article className="my-listings-summary-card">
      <span>{icon}</span>

      <div>
        <small>{title}</small>
        <strong>{loading ? "—" : value}</strong>
      </div>
    </article>
  );
}

function ListingCard({
  listing,
  imageUrl,
  deleting,
  updating,
  onDelete,
  onStatusChange,
}) {
  const listingId = listing._id || listing.id;
  const currentStatus = listing.status || "Available";
  const isAvailable =
    String(currentStatus).toLowerCase() === "available";

  const createdDate = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Recently added";

  return (
    <article className="my-listing-card">
      <Link
        to={`/item/${listingId}`}
        className="my-listing-image"
      >
        <img
  src={imageUrl}
  alt={listing.title || "Listing"}
  onError={(event) => {
    event.currentTarget.src =
      "/placeholder-image.png";
  }}
/>

        <span
          className={`my-listing-status ${
            isAvailable ? "available" : ""
          }`}
        >
          {currentStatus}
        </span>

        <span className="my-listing-condition">
          {listing.condition || "Good condition"}
        </span>
      </Link>

      <div className="my-listing-body">
        <span className="my-listing-category">
          {listing.category || "Clothing"}
        </span>

        <h3>{listing.title || "Untitled listing"}</h3>

        <p>
          {listing.brand || "Unbranded"}
          {listing.size ? ` · Size ${listing.size}` : ""}
        </p>

        <div className="my-listing-details">
          <span>
            <FaMapMarkerAlt />
            {listing.location || "Not specified"}
          </span>

          <span>{createdDate}</span>
        </div>

        <div className="my-listing-value">
          <small>Estimated value</small>
          <strong>
            ₹
            {Number(
              listing.estimatedValue || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="my-listing-actions">
          <Link
            to={`/item/${listingId}`}
            title="View listing"
          >
            <FaEye />
            View
          </Link>

          <Link
            to={`/edit-listing/${listingId}`}
            title="Edit listing"
          >
            <FaEdit />
            Edit
          </Link>

          <button
            type="button"
            onClick={onStatusChange}
            disabled={updating}
            title="Change listing status"
          >
            <FaSyncAlt />
            {updating
              ? "Updating..."
              : isAvailable
                ? "Mark swapped"
                : "Mark available"}
          </button>

          <button
            type="button"
            className="my-listing-delete"
            onClick={onDelete}
            disabled={deleting}
            title="Delete listing"
          >
            <FaTrash />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MyListings;