import { FaSearch, FaTimes } from "react-icons/fa";

function SwapSearch({ search, setSearch }) {
  return (
    <div className="relative w-full">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        placeholder="Search by user, requested item, or offered item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-12 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
      />

      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}

export default SwapSearch;