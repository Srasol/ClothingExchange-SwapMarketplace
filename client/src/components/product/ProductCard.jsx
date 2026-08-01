import { Link } from "react-router-dom";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaEye,
} from "react-icons/fa";
import "./ProductCard.css";

const API_BASE_URL = "http://localhost:5000";

function getImageUrl(image) {
  if (!image) {
    return "https://placehold.co/600x500?text=No+Image";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const normalizedPath = image.replace(/\\/g, "/");

  if (normalizedPath.startsWith("/")) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  return `${API_BASE_URL}/${normalizedPath}`;
}

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={getImageUrl(product.image)}
          alt={product.title}
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x500?text=No+Image";
          }}
        />

        <button className="wishlist-btn">
          <FaHeart />
        </button>

        <span className="condition-badge">
          {product.condition}
        </span>
      </div>

      <div className="product-content">
        <h3>{product.title}</h3>

        <p className="brand">{product.brand}</p>

        <div className="details">
          <span>{product.category}</span>
          <span>Size: {product.size}</span>
        </div>

        <div className="location">
          <FaMapMarkerAlt />
          {product.location}
        </div>

        <div className="price">
          ₹{Number(product.estimatedValue || 0).toLocaleString("en-IN")}
        </div>

        <div className="buttons">
          <Link
            to={`/item/${product._id}`}
            className="view-btn"
          >
            <FaEye />
            View
          </Link>

          <button className="swap-btn">
            <FaExchangeAlt />
            Swap
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;