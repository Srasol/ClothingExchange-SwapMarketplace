import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaComments,
  FaExchangeAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaRegHeart,
  FaShareAlt,
  FaStar,
  FaTshirt,
  FaUser,
} from "react-icons/fa";

import API from "../services/api";
import "../styles/itemDetails.css";
import {
  getImageUrl,
} from "../utils/imageUrl";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const currentUserId = storedUser._id || storedUser.id;

  const [item, setItem] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [swapMessage, setSwapMessage] = useState(
    "I would like to swap for this item."
  );
  const [showSwapBox, setShowSwapBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadItem();
    loadWishlist();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError("");

      const [itemResponse, listingsResponse] =
        await Promise.all([
          API.get(`/listings/${id}`),
          API.get("/listings"),
        ]);

      const itemData =
        itemResponse.data?.listing || itemResponse.data;

      const listingsData = Array.isArray(
        listingsResponse.data
      )
        ? listingsResponse.data
        : listingsResponse.data?.listings || [];

      setItem(itemData);
      setSelectedImage(getImageUrl(itemData?.image));

      const related = listingsData
        .filter(
          (listing) =>
            listing._id !== id &&
            (listing.category === itemData?.category ||
              listing.size === itemData?.size)
        )
        .slice(0, 4);

      setRelatedListings(related);
    } catch (requestError) {
      console.error(
        "Load item error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load this listing."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const response = await API.get("/wishlist");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.wishlist || [];

      setWishlist(
        data.some((entry) => {
          const listingId =
            entry?.listing?._id || entry?.listing;

          return String(listingId) === String(id);
        })
      );
    } catch (requestError) {
      console.error(
        "Load wishlist error:",
        requestError.response?.data ||
          requestError.message
      );
    }
  };

  

  const owner = item?.owner || {};
  const ownerId =
    typeof owner === "object" ? owner._id : owner;
  const ownerName =
    typeof owner === "object"
      ? owner.name || "Marketplace member"
      : "Marketplace member";

  const isOwner =
    currentUserId &&
    ownerId &&
    String(currentUserId) === String(ownerId);

  const handleWishlist = async () => {
    try {
      setWishlistLoading(true);

      if (wishlist) {
        await API.delete(`/wishlist/${id}`);
        setWishlist(false);
      } else {
        await API.post(`/wishlist/${id}`);
        setWishlist(true);
      }
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
          "Unable to update wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSwapRequest = async () => {
    if (!currentUserId) {
      setMessage("Please log in before requesting a swap.");
      return;
    }

    if (!ownerId) {
      setMessage(
        "This listing does not have a valid owner."
      );
      return;
    }

    try {
      setSwapLoading(true);
      setMessage("");

      await API.post("/swaps", {
        sender: currentUserId,
        receiver: ownerId,
        offeredItem: item._id,
        requestedItem: item._id,
        message: swapMessage.trim(),
      });

      setMessage("Swap request sent successfully.");
      setShowSwapBox(false);
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
          "Unable to send swap request."
      );
    } finally {
      setSwapLoading(false);
    }
  };

  const handleChat = () => {
    if (!ownerId) {
      setMessage("Owner information is unavailable.");
      return;
    }

    navigate(`/chat?user=${ownerId}&listing=${item._id}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: item?.title || "Clothing listing",
      text: `Check out ${item?.title || "this item"}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );
        setMessage("Listing link copied.");
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") {
        setMessage("Unable to share this listing.");
      }
    }
  };

  const formattedDate = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Recently listed";

  if (loading) {
    return (
      <main className="premium-item-page">
        <div className="item-details-loading">
          <div className="item-loading-image" />
          <div className="item-loading-content" />
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="premium-item-page">
        <section className="item-error-state">
          <FaTshirt />
          <h1>Listing unavailable</h1>
          <p>{error || "This item could not be found."}</p>

          <Link to="/listings">
            <FaArrowLeft />
            Return to marketplace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-item-page">
      <div className="item-details-breadcrumb">
        <Link to="/listings">
          <FaArrowLeft />
          Marketplace
        </Link>

        <span>/</span>
        <span>{item.category || "Clothing"}</span>
        <span>/</span>
        <strong>{item.title}</strong>
      </div>

      <section className="premium-item-layout">
        <div className="item-gallery-column">
          <div className="item-main-image">
           <img
  src={
    selectedImage ||
    getImageUrl(item.image)
  }
  alt={item.title || "Listing"}
  onError={(event) => {
    event.currentTarget.src =
      "/placeholder-image.png";
  }}
/>


            <span className="item-image-condition">
              {item.condition || "Good condition"}
            </span>

            <button
              type="button"
              className={`item-floating-wishlist ${
                wishlist ? "saved" : ""
              }`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              {wishlist ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="item-thumbnail-strip">
            {[item.image, ...(item.images || [])]
              .filter(Boolean)
              .slice(0, 5)
              .map((image, index) => {
                const imageUrl = getImageUrl(image);

                return (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={
                      selectedImage === imageUrl
                        ? "active"
                        : ""
                    }
                    onClick={() => setSelectedImage(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${item.title} ${index + 1}`}
                    />
                  </button>
                );
              })}
          </div>
        </div>

        <aside className="item-information-panel">
          <div className="item-top-meta">
            <span>{item.category || "Clothing"}</span>

            <span
              className={`item-status-badge ${
                (item.status || "Available")
                  .toLowerCase()
                  .replaceAll(" ", "-")
              }`}
            >
              {item.status || "Available"}
            </span>
          </div>

          <h1>{item.title}</h1>

          <p className="item-brand-line">
            {item.brand || "Independent brand"}
            {item.size ? ` · Size ${item.size}` : ""}
          </p>

          <div className="item-value-block">
            <span>Estimated swap value</span>
            <strong>
              ₹
              {Number(
                item.estimatedValue || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="item-detail-grid">
            <DetailItem
              label="Category"
              value={item.category || "Not specified"}
            />
            <DetailItem
              label="Size"
              value={item.size || "Not specified"}
            />
            <DetailItem
              label="Condition"
              value={item.condition || "Not specified"}
            />
            <DetailItem
              label="Location"
              value={item.location || "Not specified"}
            />
          </div>

          {item.description && (
            <div className="item-description-block">
              <span>ABOUT THIS ITEM</span>
              <p>{item.description}</p>
            </div>
          )}

          {message && (
            <div className="item-action-message">
              {message}
            </div>
          )}

          {!isOwner && (
            <>
              <div className="item-primary-actions">
                <button
                  type="button"
                  className="item-swap-button"
                  onClick={() =>
                    setShowSwapBox((previous) => !previous)
                  }
                  disabled={
                    (item.status || "Available")
                      .toLowerCase() !== "available"
                  }
                >
                  <FaExchangeAlt />
                  Request swap
                </button>

                <button
                  type="button"
                  className="item-chat-button"
                  onClick={handleChat}
                >
                  <FaComments />
                  Chat
                </button>
              </div>

              {showSwapBox && (
                <div className="item-swap-box">
                  <label htmlFor="swapMessage">
                    Message to owner
                  </label>

                  <textarea
                    id="swapMessage"
                    rows="4"
                    value={swapMessage}
                    onChange={(event) =>
                      setSwapMessage(event.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={handleSwapRequest}
                    disabled={swapLoading}
                  >
                    {swapLoading
                      ? "Sending..."
                      : "Send swap request"}
                  </button>
                </div>
              )}
            </>
          )}

          {isOwner && (
            <div className="item-owner-notice">
              <FaCheckCircle />
              This is your listing.
            </div>
          )}

          <div className="item-secondary-actions">
            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              {wishlist ? <FaHeart /> : <FaRegHeart />}
              {wishlist
                ? "Saved to wishlist"
                : "Add to wishlist"}
            </button>

            <button
              type="button"
              onClick={handleShare}
            >
              <FaShareAlt />
              Share listing
            </button>
          </div>

          <div className="item-listing-meta">
            <span>
              <FaMapMarkerAlt />
              {item.location || "Location unavailable"}
            </span>

            <span>
              <FaCalendarAlt />
              Listed {formattedDate}
            </span>
          </div>
        </aside>
      </section>

      <section className="item-owner-section">
        <div className="item-owner-profile">
          <div className="item-owner-avatar">
            {typeof owner === "object" &&
            owner.profileImage ? (
              <img
                src={getImageUrl(owner.profileImage)}
                alt={ownerName}
              />
            ) : (
              <span>
                {ownerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="item-owner-copy">
            <span>LISTED BY</span>
            <h2>{ownerName}</h2>

            <p>
              <FaMapMarkerAlt />
              {typeof owner === "object" &&
              owner.location
                ? owner.location
                : item.location ||
                  "Marketplace member"}
            </p>
          </div>
        </div>

        <div className="item-owner-stats">
          <div>
            <strong>
              {typeof owner === "object"
                ? owner.completedSwaps || 0
                : 0}
            </strong>
            <span>Completed swaps</span>
          </div>

          <div>
            <strong>
              <FaStar />
              {typeof owner === "object"
                ? owner.rating || "New"
                : "New"}
            </strong>
            <span>Member rating</span>
          </div>
        </div>

        {!isOwner && ownerId && (
          <button
            type="button"
            onClick={handleChat}
          >
            Contact owner
            <FaArrowRight />
          </button>
        )}
      </section>

      {relatedListings.length > 0 && (
        <section className="related-listings-section">
          <div className="related-listings-heading">
            <div>
              <span>MORE TO DISCOVER</span>
              <h2>You may also like</h2>
            </div>

            <Link to="/listings">
              View marketplace
              <FaArrowRight />
            </Link>
          </div>

          <div className="related-listings-grid">
            {relatedListings.map((listing) => (
              <Link
                to={`/item/${listing._id}`}
                key={listing._id}
                className="related-listing-card"
              >
                <div>
                  <img
                    src={getImageUrl(listing.image)}
                    alt={listing.title}
                  />

                  <span>
                    {listing.condition || "Good"}
                  </span>
                </div>

                <section>
                  <small>
                    {listing.category || "Clothing"}
                  </small>
                  <h3>{listing.title}</h3>
                  <p>
                    {listing.brand || "Independent"}
                    {listing.size
                      ? ` · Size ${listing.size}`
                      : ""}
                  </p>

                  <strong>
                    ₹
                    {Number(
                      listing.estimatedValue || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </section>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="item-detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default ItemDetails;