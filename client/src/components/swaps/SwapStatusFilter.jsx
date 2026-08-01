import { FaFilter } from "react-icons/fa";

function SwapStatusFilter({
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="relative w-full">
      <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
        className="w-full appearance-none rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-10 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
      >
        <option value="All">All Requests</option>
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="Rejected">Rejected</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  );
}

export default SwapStatusFilter;