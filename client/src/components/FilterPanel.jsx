import {
  FaTshirt,
  FaRuler,
  FaTrademark,
  FaStar,
  FaMapMarkerAlt,
  FaSlidersH,
  FaRedo,
} from "react-icons/fa";

function FilterPanel({
  category,
  setCategory,
  size,
  setSize,
  brand,
  setBrand,
  condition,
  setCondition,
  location,
  setLocation,
  sort,
  setSort,
  resetFilters,
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <FaSlidersH />
          Filters
        </h2>

        <button
          onClick={resetFilters}
          className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          <FaRedo />
          Reset
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

        {/* Category */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <FaTshirt />
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full rounded-xl border p-3 outline-none focus:ring-4 focus:ring-violet-200"
          >
            <option>All</option>
            <option>T-Shirt</option>
            <option>Shirt</option>
            <option>Jeans</option>
            <option>Dress</option>
            <option>Jacket</option>
            <option>Shoes</option>
            <option>Kurta</option>
            <option>Saree</option>
            <option>Other</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <FaRuler />
            Size
          </label>

          <select
            value={size}
            onChange={(e) =>
              setSize(e.target.value)
            }
            className="w-full rounded-xl border p-3 outline-none focus:ring-4 focus:ring-violet-200"
          >
            <option>All</option>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>XXL</option>
            <option>Free Size</option>
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <FaTrademark />
            Brand
          </label>

          <input
            type="text"
            value={brand}
            onChange={(e) =>
              setBrand(e.target.value)
            }
            placeholder="Nike"
            className="w-full rounded-xl border p-3 outline-none focus:ring-4 focus:ring-violet-200"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <FaStar />
            Condition
          </label>

          <select
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value)
            }
            className="w-full rounded-xl border p-3 outline-none focus:ring-4 focus:ring-violet-200"
          >
            <option>All</option>
            <option>New</option>
            <option>Like New</option>
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <FaMapMarkerAlt />
            Location
          </label>

          <input
            type="text"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            placeholder="Hyderabad"
            className="w-full rounded-xl border p-3 outline-none focus:ring-4 focus:ring-violet-200"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <FaSlidersH />
            Sort By
          </label>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="w-full rounded-xl border p-3 outline-none focus:ring-4 focus:ring-violet-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="value-low-high">Value: Low → High</option>
            <option value="value-high-low">Value: High → Low</option>
            <option value="title-a-z">Title A → Z</option>
            <option value="title-z-a">Title Z → A</option>
          </select>
        </div>

      </div>
    </div>
  );
}

export default FilterPanel;