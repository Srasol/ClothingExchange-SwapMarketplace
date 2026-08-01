import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaHeart,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaSearch,
  FaSpinner,
  FaTag,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import API from "../services/api";
import PageHeader from "../components/PageHeader";
import getImageUrl from "../utils/imageUrl";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/wishlist");

      const wishlistData = Array.isArray(response.data)
        ? response.data
        : response.data?.wishlist || [];

      setWishlist(wishlistData);
    } catch (err) {
      console.error(
        "Load wishlist error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };


  const removeWishlist = async (listingId) => {
    const confirmed = window.confirm(
      "Remove this item from your wishlist?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingId(listingId);

      await API.delete(`/wishlist/${listingId}`);

      setWishlist((previousWishlist) =>
        previousWishlist.filter(
          (item) => item.listing?._id !== listingId
        )
      );
    } catch (err) {
      console.error(
        "Remove wishlist error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
          "Unable to remove wishlist item."
      );
    } finally {
      setRemovingId("");
    }
  };

  const filteredWishlist = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return wishlist;
    }

    return wishlist.filter((item) => {
      const listing = item.listing;

      if (!listing) {
        return false;
      }

      return [
        listing.title,
        listing.brand,
        listing.category,
        listing.condition,
        listing.location,
        listing.size,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [wishlist, search]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl bg-white px-10 py-12 text-center shadow-xl">
          <FaSpinner className="mx-auto animate-spin text-4xl text-rose-500" />

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Loading Wishlist
          </h2>

          <p className="mt-2 text-slate-500">
            Please wait while we load your favourite items.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          label="Favourite Collection"
          title="My Wishlist"
          description="Save your favourite clothing items and quickly access them whenever you are ready to exchange."
          icon={<FaHeart />}
          count={wishlist.length}
          countLabel={
            wishlist.length === 1
              ? "Saved Item"
              : "Saved Items"
          }
          backText="Back to Marketplace"
          onBack={() => navigate("/listings")}
        />

        {error ? (
          <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl text-rose-600">
              <FaTimes />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Could not load wishlist
            </h2>

            <p className="mt-2 text-rose-700">{error}</p>

            <button
              type="button"
              onClick={loadWishlist}
              className="mt-5 rounded-2xl bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700"
            >
              Try Again
            </button>
          </section>
        ) : wishlist.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-4xl text-rose-500">
              <FaHeart />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
              Browse available clothing and save your favourite
              items here for later.
            </p>

            <Link
              to="/listings"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Browse Clothes
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Saved Clothing
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Search and manage your favourite items.
                  </p>
                </div>

                <div className="relative w-full md:max-w-md">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search wishlist..."
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-11 text-slate-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500"
                      aria-label="Clear search"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </section>

            {filteredWishlist.length === 0 ? (
              <section className="mt-8 rounded-3xl bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-500">
                  <FaSearch />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No matching items
                </h2>

                <p className="mt-2 text-slate-500">
                  Try searching with a different title, brand,
                  category, or location.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
                >
                  Clear Search
                </button>
              </section>
            ) : (
              <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredWishlist.map((item) => {
                  const listing = item.listing;

                  if (!listing) {
                    return null;
                  }

                  const isRemoving =
                    removingId === listing._id;

                  return (
                    <article
                      key={item._id}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative overflow-hidden bg-slate-100">
                        <img
                          src={getImageUrl(listing.image)}
                          alt={listing.title}
                          className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm backdrop-blur">
                          {listing.category || "Clothing"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeWishlist(listing._id)
                          }
                          disabled={isRemoving}
                          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-md backdrop-blur transition hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Remove from wishlist"
                        >
                          {isRemoving ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className="truncate text-xl font-bold text-slate-900">
                              {listing.title}
                            </h2>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {listing.brand ||
                                "Brand not specified"}
                            </p>
                          </div>

                          <FaHeart className="shrink-0 text-xl text-rose-500" />
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                              <FaMoneyBillWave />
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Estimated Value
                              </p>

                              <p className="font-bold text-emerald-700">
                                ₹{listing.estimatedValue || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                              <FaMapMarkerAlt />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Location
                              </p>

                              <p className="truncate font-semibold">
                                {listing.location ||
                                  "Not specified"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                              <FaTag />
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Condition
                              </p>

                              <p className="font-semibold">
                                {listing.condition ||
                                  "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/item/${listing._id}`}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <FaEye />
                          View Details
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Wishlist;