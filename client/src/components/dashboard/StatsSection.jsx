import { FaCheckCircle, FaExchangeAlt, FaHeart, FaTshirt } from "react-icons/fa";
import StatsCard from "./StatsCard";

function StatsSection({
  loading,
  userListings,
  pendingSwaps,
  completedSwaps,
}) {
  return (
    <section className="dashboard-stat-grid">
      <StatsCard
        title="My Listings"
        value={loading ? "..." : userListings.length}
        subtitle="Uploaded clothing items"
        icon={<FaTshirt />}
        color="blue"
      />

      <StatsCard
        title="Pending Swaps"
        value={loading ? "..." : pendingSwaps.length}
        subtitle="Waiting for action"
        icon={<FaExchangeAlt />}
        color="orange"
      />

      <StatsCard
        title="Completed Swaps"
        value={loading ? "..." : completedSwaps.length}
        subtitle="Successful exchanges"
        icon={<FaCheckCircle />}
        color="green"
      />

      <StatsCard
        title="Wishlist"
        value="0"
        subtitle="Saved items"
        icon={<FaHeart />}
        color="red"
      />
    </section>
  );
}

export default StatsSection;