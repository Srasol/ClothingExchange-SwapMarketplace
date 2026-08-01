import { FaSearch, FaTimes } from "react-icons/fa";

function SearchBar({
  search,
  setSearch,
}) {
  return (
    <div className="relative">

      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        placeholder="Search clothes, brands, category..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full rounded-2xl border border-gray-300 bg-white py-4 pl-14 pr-14 text-lg shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-200"
      />

      {search && (
        <button
          type="button"
          onClick={() =>
            setSearch("")
          }
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-red-500"
        >
          <FaTimes />
        </button>
      )}

    </div>
  );
}

export default SearchBar;