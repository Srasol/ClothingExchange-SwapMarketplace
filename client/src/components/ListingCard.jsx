import { Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaTag,
  FaTrademark,
  FaRuler,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

function ListingCard({
  item,
  isWishlisted,
  isUpdatingWishlist,
  toggleWishlist,
  getImageUrl,
}) {
  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

      <div className="relative overflow-hidden">

        <img
          src={getImageUrl(item.image)}
          alt={item.title}
          className="h-72 w-full object-cover transition duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x400?text=No+Image";
          }}
        />

        <button
          onClick={() =>
            toggleWishlist(item._id)
          }
          disabled={isUpdatingWishlist}
          className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition ${
            isWishlisted
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {isWishlisted ? (
            <FaHeart />
          ) : (
            <FaRegHeart />
          )}
        </button>

        <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white">
          {item.status || "Available"}
        </span>

      </div>

      <div className="space-y-4 p-6">

        <div>
          <span className="text-sm font-semibold text-violet-600">
            <FaTag className="mr-2 inline" />
            {item.category}
          </span>

          <h2 className="mt-2 text-2xl font-bold">
            {item.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-gray-500">
            {item.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">

          <div>
            <FaTrademark className="mr-2 inline text-violet-600" />
            {item.brand}
          </div>

          <div>
            <FaRuler className="mr-2 inline text-violet-600" />
            {item.size}
          </div>

          <div>
            <FaMapMarkerAlt className="mr-2 inline text-violet-600" />
            {item.location}
          </div>

          <div className="font-semibold text-emerald-600">
            <FaMoneyBillWave className="mr-2 inline" />
            ₹{item.estimatedValue}
          </div>

        </div>

        <Link
          to={`/item/${item._id}`}
          className="block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-center font-semibold text-white transition hover:scale-[1.02]"
        >
          View Details
        </Link>

      </div>

    </div>
  );
}

export default ListingCard;