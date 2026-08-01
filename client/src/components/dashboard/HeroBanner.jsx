import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaMapMarkerAlt,
  FaPlus,
  FaTshirt,
  FaUser,
} from "react-icons/fa";

function HeroBanner({ storedUser }) {
  return (
    <section className="dashboard-welcome">
      <div className="dashboard-welcome-content">
        <span className="dashboard-welcome-label">
          CLOTHING EXCHANGE
        </span>

        <h1>
          Welcome back, <span>{storedUser.name || "User"}</span>
        </h1>

        <p>
          Manage your listings, track swaps and discover clothing
          available near you.
        </p>

        <div className="dashboard-user-details">
          <span>
            <FaUser />
            {storedUser.role === "admin"
              ? "Administrator"
              : "Marketplace Member"}
          </span>

          <span>
            <FaMapMarkerAlt />
            {storedUser.location || "Location not added"}
          </span>
        </div>

        <div className="dashboard-welcome-actions">
          <Link
            to="/add-listing"
            className="dashboard-primary-button"
          >
            <FaPlus />
            Add New Listing
          </Link>

          <Link
            to="/listings"
            className="dashboard-outline-button"
          >
            Browse Items
            <FaArrowRight />
          </Link>
        </div>
      </div>

      <div className="dashboard-welcome-visual">
        <div className="dashboard-visual-circle dashboard-circle-one" />
        <div className="dashboard-visual-circle dashboard-circle-two" />

        <div className="dashboard-visual-card">
          <FaTshirt />
          <strong>Swap. Reuse. Repeat.</strong>
          <span>Sustainable fashion starts here.</span>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;