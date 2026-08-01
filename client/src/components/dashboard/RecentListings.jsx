import { Link } from "react-router-dom";
import { FaArrowRight, FaMapMarkerAlt, FaTshirt } from "react-icons/fa";

function RecentListings({
  loading,
  recentListings,
  getImageUrl,
  formatDate,
}) {
  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-heading">
        <div>
          <span>ACTIVITY</span>
          <h2>Recent Listings</h2>
        </div>

        <Link to="/listings">
          View All
          <FaArrowRight />
        </Link>
      </div>

      <div className="dashboard-listing-list">
        {loading ? (
          <DashboardListSkeleton count={4} />
        ) : recentListings.length > 0 ? (
          recentListings.map((listing) => (
            <Link
              key={listing._id}
              to={`/item/${listing._id}`}
              className="dashboard-listing-row"
            >
              <img
                src={getImageUrl(listing.image)}
                alt={listing.title}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/180x140?text=Item";
                }}
              />

              <div className="dashboard-listing-info">
                <strong>{listing.title}</strong>

                <span>
                  {listing.category || "Clothing"}
                  {listing.size ? ` • Size ${listing.size}` : ""}
                </span>

                <small>
                  <FaMapMarkerAlt />
                  {listing.location || "Location not provided"}
                </small>
              </div>

              <div className="dashboard-listing-meta">
                <span
                  className={`dashboard-listing-status ${
                    listing.status?.toLowerCase() === "available"
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {listing.status || "Available"}
                </span>

                <small>{formatDate(listing.createdAt)}</small>
              </div>
            </Link>
          ))
        ) : (
          <DashboardEmptyState
            icon={<FaTshirt />}
            title="No listings found"
            text="Create your first listing and start exchanging clothes."
            buttonText="Add Listing"
            path="/add-listing"
          />
        )}
      </div>
    </article>
  );
}

function DashboardEmptyState({
  icon,
  title,
  text,
  buttonText,
  path,
}) {
  return (
    <div className="dashboard-empty-state">
      <div className="dashboard-empty-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>

      <Link
        to={path}
        className="dashboard-empty-button"
      >
        {buttonText}
      </Link>
    </div>
  );
}

function DashboardListSkeleton({ count }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="dashboard-row-skeleton"
        >
          <div className="dashboard-skeleton-avatar" />

          <div className="dashboard-skeleton-text">
            <div className="dashboard-skeleton-line large" />
            <div className="dashboard-skeleton-line" />
          </div>
        </div>
      ))}
    </>
  );
}

export default RecentListings;