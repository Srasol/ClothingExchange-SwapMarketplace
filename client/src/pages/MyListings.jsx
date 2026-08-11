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
import { getImageUrl } from "../utils/imageUrl";

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
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }

      if (sort === "value-low-high") {
        return Number(a.estimatedValue || 0) - Number(b.estimatedValue || 0);
      }

      if (sort === "value-high-low") {
        return Number(b.estimatedValue || 0) - Number(a.estimatedValue || 0);
      }

      if (sort === "title-a-z") {
        return String(a.title || "").localeCompare(
          String(b.title || "")
        );
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [listings, search, category, status, sort]);

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
                status: updatedListing?.status || nextStatus,
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
            Manage every item you have shared and update its availability.
          </p>
        </div>

        <Link to="/add-listing">
          <FaPlus />
          Add new listing
        </Link>
      </section>

      <section className="my-listings-controls">
        <div className="my-listings-search">
          <FaSearch />

          <input
            type="search"
            placeholder="Search listings..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
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
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="value-low-high">Value: low to high</option>
          <option value="value-high-low">Value: high to low</option>
          <option value="title-a-z">Title: A to Z</option>
        </select>
      </section>

      {error && (
        <div className="my-listings-error">
          <p>{error}</p>
          <button type="button" onClick={loadListings}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading listings...</p>
      ) : filteredListings.length === 0 ? (
        <section className="my-listings-empty">
          <FaBoxOpen />
          <h2>No listings found</h2>
          <p>Add your first clothing item to begin.</p>

          <Link to="/add-listing">
            <FaPlus />
            Add listing
          </Link>
        </section>
      ) : (
        <section className="my-listings-grid">
          {filteredListings.map((listing) => (
            <article
              className="my-listing-card"
              key={listing._id}
            >
              <Link
                to={`/item/${listing._id}`}
                className="my-listing-image"
              >
                <img
                  src={getImageUrl(listing.image)}
                  alt={listing.title || "Listing"}
                  onError={(event) => {
                    event.currentTarget.src =
                      "/placeholder-image.png";
                  }}
                />

                <span>
                  {listing.status || "Available"}
                </span>
              </Link>

              <div className="my-listing-body">
                <h3>{listing.title || "Untitled listing"}</h3>

                <p>
                  {listing.brand || "Unbranded"}
                  {listing.size ? ` · Size ${listing.size}` : ""}
                </p>

                <span>
                  <FaMapMarkerAlt />
                  {listing.location || "Not specified"}
                </span>

                <strong>
                  ₹
                  {Number(
                    listing.estimatedValue || 0
                  ).toLocaleString("en-IN")}
                </strong>

                <div className="my-listing-actions">
                  <Link to={`/item/${listing._id}`}>
                    <FaEye />
                    View
                  </Link>

                  <Link to={`/edit-listing/${listing._id}`}>
                    <FaEdit />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      toggleListingStatus(listing)
                    }
                    disabled={updatingId === listing._id}
                  >
                    <FaSyncAlt />
                    {updatingId === listing._id
                      ? "Updating..."
                      : "Change status"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteListing(listing._id)
                    }
                    disabled={deletingId === listing._id}
                  >
                    <FaTrash />
                    {deletingId === listing._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="my-listings-cta">
        <Link to="/add-listing">
          Add another listing
          <FaArrowRight />
        </Link>
      </section>
    </main>
  );
}

export default MyListings;