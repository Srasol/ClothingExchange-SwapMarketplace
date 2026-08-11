import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaComments,
  FaExchangeAlt,
  FaHeart,
  FaLeaf,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaTshirt,
  FaUserCircle,
} from "react-icons/fa";
import api from "../services/api";
import "../styles/dashboard.css";
import {
  getImageUrl,
} from "../utils/imageUrl";


function Dashboard() {
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const userId = storedUser._id || storedUser.id;

  const [listings, setListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDashboardError("");

      const [listingsResult, swapsResult, wishlistResult] =
        await Promise.allSettled([
          api.get("/listings"),
          api.get("/swaps"),
          api.get("/wishlist"),
        ]);

      if (listingsResult.status === "fulfilled") {
        const data = listingsResult.value.data;
        setListings(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.listings)
              ? data.listings
              : []
        );
      }

      if (swapsResult.status === "fulfilled") {
        const data = swapsResult.value.data;
        setSwaps(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.swaps)
              ? data.swaps
              : []
        );
      }

      if (wishlistResult.status === "fulfilled") {
        const data = wishlistResult.value.data;
        const wishlist = Array.isArray(data)
          ? data
          : Array.isArray(data?.wishlist)
            ? data.wishlist
            : [];

        setWishlistCount(wishlist.length);
      }

      if (
        listingsResult.status === "rejected" &&
        swapsResult.status === "rejected"
      ) {
        setDashboardError(
          "Dashboard information could not be loaded. Please check the server."
        );
      }
    } catch (error) {
      setDashboardError(
        error.response?.data?.message ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  };

  const userListings = listings.filter((listing) => {
    const ownerId =
      typeof listing.owner === "object"
        ? listing.owner?._id
        : listing.owner;

    return String(ownerId) === String(userId);
  });

  const userSwaps = swaps.filter((swap) => {
    const senderId =
      typeof swap.sender === "object"
        ? swap.sender?._id
        : swap.sender;

    const receiverId =
      typeof swap.receiver === "object"
        ? swap.receiver?._id
        : swap.receiver;

    return (
      String(senderId) === String(userId) ||
      String(receiverId) === String(userId)
    );
  });

  const pendingSwaps = userSwaps.filter(
    (swap) => String(swap.status || "").toLowerCase() === "pending"
  );

  const completedSwaps = userSwaps.filter(
    (swap) => String(swap.status || "").toLowerCase() === "completed"
  );

  const recentListings = [...listings]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 6);

  const featuredListings = recentListings.slice(0, 3);

 

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    navigate(
      value
        ? `/listings?search=${encodeURIComponent(value)}`
        : "/listings"
    );
  };

  const stats = [
    {
      title: "My Listings",
      value: userListings.length,
      text: "Items shared",
      icon: <FaTshirt />,
      link: "/my-listings",
    },
    {
      title: "Pending Swaps",
      value: pendingSwaps.length,
      text: "Need attention",
      icon: <FaExchangeAlt />,
      link: "/swap-requests",
    },
    {
      title: "Completed",
      value: completedSwaps.length,
      text: "Successful swaps",
      icon: <FaCheckCircle />,
      link: "/swap-requests",
    },
    {
      title: "Wishlist",
      value: wishlistCount,
      text: "Saved items",
      icon: <FaHeart />,
      link: "/wishlist",
    },
  ];

  const quickActions = [
    {
      title: "Add Listing",
      text: "Upload a clothing item",
      icon: <FaPlus />,
      link: "/add-listing",
    },
    {
      title: "Browse Items",
      text: "Discover available clothes",
      icon: <FaSearch />,
      link: "/listings",
    },
    {
      title: "Swap Requests",
      text: "Manage your swaps",
      icon: <FaExchangeAlt />,
      link: "/swap-requests",
    },
    {
      title: "Open Chat",
      text: "Message other members",
      icon: <FaComments />,
      link: "/chat",
    },
  ];

  return (
    <main className="market-dashboard">
      <section className="market-hero">
        <div className="market-hero-copy">
          <span className="market-eyebrow">
            CLOTHING EXCHANGE MARKETPLACE
          </span>

          <h1>
            Welcome back,
            <span>{storedUser?.name || "Member"}.</span>
          </h1>

          <p>
            Manage your wardrobe, discover nearby clothing
            and turn unused pieces into meaningful swaps.
          </p>

          <form className="market-search" onSubmit={handleSearch}>
            <FaSearch />

            <input
              type="search"
              placeholder="Search shirts, jackets, sarees..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <button type="submit">Explore</button>
          </form>

          <div className="market-hero-actions">
            <Link to="/add-listing" className="market-primary-action">
              <FaPlus />
              Add Listing
            </Link>

            <Link to="/profile" className="market-secondary-action">
              <FaUserCircle />
              View Profile
            </Link>
          </div>
        </div>

        <div className="market-hero-visual">
          <HeroListing
            className="market-visual-main"
            item={featuredListings[0]}
            getImageUrl={getImageUrl}
          />

          <HeroListing
            className="market-visual-small market-visual-small-one"
            item={featuredListings[1]}
            getImageUrl={getImageUrl}
          />

          <HeroListing
            className="market-visual-small market-visual-small-two"
            item={featuredListings[2]}
            getImageUrl={getImageUrl}
          />
        </div>
      </section>

      {dashboardError && (
        <div className="market-error">
          <span>{dashboardError}</span>
          <button type="button" onClick={fetchDashboardData}>
            Try again
          </button>
        </div>
      )}

      <section className="market-stats">
        {stats.map((stat) => (
          <Link
            to={stat.link}
            className="market-stat-card"
            key={stat.title}
          >
            <span className="market-stat-icon">{stat.icon}</span>

            <div>
              <span>{stat.title}</span>
              <strong>{loading ? "—" : stat.value}</strong>
              <small>{stat.text}</small>
            </div>
          </Link>
        ))}
      </section>

      <section className="market-bento">
        <div className="market-recent-card">
          <div className="market-section-heading">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>Latest listings</h2>
            </div>

            <Link to="/listings">
              View all
              <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="market-recent-loading">
              {[1, 2, 3].map((item) => (
                <div key={item} />
              ))}
            </div>
          ) : recentListings.length === 0 ? (
            <div className="market-empty">
              <FaTshirt />
              <h3>No listings yet</h3>
              <p>Add your first clothing item to get started.</p>
              <Link to="/add-listing">Add listing</Link>
            </div>
          ) : (
            <div className="market-recent-list">
              {recentListings.slice(0, 4).map((listing) => (
                <Link
                  to={`/item/${listing._id || listing.id}`}
                  className="market-recent-item"
                  key={listing._id || listing.id}
                >
                  <img
                    src={getImageUrl(listing.image)}
                    alt={listing.title || "Clothing item"}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/300x360?text=Clothing";
                    }}
                  />

                  <div>
                    <span>{listing.category || "Clothing"}</span>
                    <h3>{listing.title || "Untitled item"}</h3>
                    <p>
                      {listing.brand || "Unbranded"}
                      {listing.size ? ` · Size ${listing.size}` : ""}
                    </p>
                  </div>

                  <small>
                    <FaMapMarkerAlt />
                    {listing.location || "Not specified"}
                  </small>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="market-quick-card">
          <div className="market-section-heading">
            <div>
              <span>SHORTCUTS</span>
              <h2>Quick actions</h2>
            </div>
          </div>

          <div className="market-quick-grid">
            {quickActions.map((action) => (
              <Link
                to={action.link}
                className="market-quick-action"
                key={action.title}
              >
                <span>{action.icon}</span>

                <div>
                  <strong>{action.title}</strong>
                  <small>{action.text}</small>
                </div>

                <FaArrowRight />
              </Link>
            ))}
          </div>
        </div>

        <div className="market-impact-card">
          <span className="market-impact-icon">
            <FaLeaf />
          </span>

          <div>
            <span>SUSTAINABILITY IMPACT</span>
            <h2>
              {completedSwaps.length * 4 || 0} kg waste saved
            </h2>
            <p>
              Every completed swap helps extend the life of
              clothing and reduces textile waste.
            </p>
          </div>

          <div className="market-impact-progress">
            <span
              style={{
                width: `${Math.min(
                  completedSwaps.length * 10,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="market-discover">
        <div className="market-section-heading market-section-heading-wide">
          <div>
            <span>DISCOVER</span>
            <h2>Fresh marketplace finds</h2>
          </div>

          <Link to="/listings">
            Browse marketplace
            <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="market-product-grid">
            {[1, 2, 3].map((item) => (
              <div className="market-product-skeleton" key={item} />
            ))}
          </div>
        ) : recentListings.length === 0 ? (
          <div className="market-discover-empty">
            <FaTshirt />
            <h3>No marketplace items found</h3>
            <p>New clothing listings will appear here.</p>
            <Link to="/add-listing">Create listing</Link>
          </div>
        ) : (
          <div className="market-product-grid">
            {recentListings.slice(0, 3).map((listing, index) => (
              <article
                className={`market-product-card market-product-card-${
                  index + 1
                }`}
                key={listing._id || listing.id}
              >
                <Link
                  to={`/item/${listing._id || listing.id}`}
                  className="market-product-image"
                >
                  <img
                    src={getImageUrl(listing.image)}
                    alt={listing.title || "Clothing item"}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/600x700?text=Clothing";
                    }}
                  />

                  <span className="market-condition">
                    {listing.condition || "Good condition"}
                  </span>
                </Link>

                <div className="market-product-body">
                  <div>
                    <span>{listing.category || "Clothing"}</span>
                    <h3>{listing.title || "Untitled item"}</h3>
                    <p>
                      {listing.brand || "Unbranded"}
                      {listing.size ? ` · Size ${listing.size}` : ""}
                    </p>
                  </div>

                  <span className="market-product-location">
                    <FaMapMarkerAlt />
                    {listing.location || "Unknown"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="market-cta">
        <div>
          <span>MAKE SPACE. CREATE IMPACT.</span>
          <h2>Give your unused clothes another story.</h2>
        </div>

        <Link to="/add-listing">
          Add a listing
          <FaArrowRight />
        </Link>
      </section>
    </main>
  );
}

function HeroListing({ className, item, getImageUrl }) {
  return (
    <Link
      to={item ? `/item/${item._id || item.id}` : "/listings"}
      className={className}
    >
      <img
        src={getImageUrl(item?.image)}
        alt={item?.title || "Featured clothing"}
      />

      {item && className.includes("market-visual-main") && (
        <div className="market-floating-label">
          <span>{item.category || "Featured item"}</span>
          <strong>{item.title}</strong>
        </div>
      )}
    </Link>
  );
}

export default Dashboard;