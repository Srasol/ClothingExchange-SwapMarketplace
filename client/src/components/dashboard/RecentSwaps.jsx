import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaExchangeAlt,
} from "react-icons/fa";

function RecentSwaps({
  loading,
  recentSwaps,
  getSwapItemTitle,
  formatDate,
  getStatusClass,
}) {
  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-heading">
        <div>
          <span>REQUESTS</span>
          <h2>Recent Swaps</h2>
        </div>

        <Link to="/swap-requests">
          View All
          <FaArrowRight />
        </Link>
      </div>

      <div className="dashboard-swap-list">
        {loading ? (
          <DashboardListSkeleton count={4} />
        ) : recentSwaps.length > 0 ? (
          recentSwaps.map((swap) => (
            <div
              key={swap._id}
              className="dashboard-swap-row"
            >
              <div className="dashboard-swap-avatar">
                <FaExchangeAlt />
              </div>

              <div className="dashboard-swap-details">
                <strong>
                  {getSwapItemTitle(swap)}
                </strong>

                <span>
                  {swap.sender?.name ||
                    swap.receiver?.name ||
                    "Marketplace User"}
                </span>

                <small>
                  {formatDate(swap.createdAt)}
                </small>
              </div>

              <span
                className={`dashboard-swap-status ${getStatusClass(
                  swap.status
                )}`}
              >
                {swap.status}
              </span>
            </div>
          ))
        ) : (
          <p>No swap requests found.</p>
        )}
      </div>
    </article>
  );
}

function DashboardListSkeleton({ count }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
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

export default RecentSwaps;