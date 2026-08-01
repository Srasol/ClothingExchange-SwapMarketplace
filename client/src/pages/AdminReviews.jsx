import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/reviews");
      setReviews(response.data?.reviews || response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const reviewedUser =
        review.reviewedUser || review.reviewee || {};

      const matchesSearch =
        !query ||
        [
          review.reviewer?.name,
          review.reviewer?.email,
          reviewedUser.name,
          reviewedUser.email,
          review.comment,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      const matchesRating =
        ratingFilter === "all" ||
        Number(review.rating) === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    try {
      setDeletingId(reviewId);
      setError("");
      setMessage("");

      await API.delete(`/admin/reviews/${reviewId}`);

      setReviews((current) =>
        current.filter((review) => review._id !== reviewId)
      );

      setMessage("Review deleted successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete review."
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="admin-page">
      <PageHeader
        title="Reviews"
        description="Review ratings, comments and moderation actions."
        count={`${reviews.length} Reviews · ${averageRating} ★`}
      />

      <Messages message={message} error={error} />

      <section className="admin-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reviewer, user or comment..."
        />

        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} stars
            </option>
          ))}
        </select>

        <button type="button" onClick={loadReviews}>
          Refresh
        </button>
      </section>

      <section className="admin-panel">
        {loading ? (
          <div className="admin-loading">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="admin-empty-text">No reviews found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Reviewed User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Swap Status</th>
                  <th>Created</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => {
                  const reviewedUser =
                    review.reviewedUser || review.reviewee || {};

                  return (
                    <tr key={review._id}>
                      <td>
                        <strong>{review.reviewer?.name || "Unknown"}</strong>
                        <span>{review.reviewer?.email || ""}</span>
                      </td>

                      <td>
                        <strong>{reviewedUser.name || "Unknown"}</strong>
                        <span>{reviewedUser.email || ""}</span>
                      </td>

                      <td>
                        <span className="admin-rating">
                          {"★".repeat(Number(review.rating || 0))}
                        </span>
                      </td>

                      <td>{review.comment || "No comment"}</td>
                      <td>{review.swap?.status || "Unavailable"}</td>
                      <td>{formatDate(review.createdAt)}</td>

                      <td className="text-right">
                        <button
                          type="button"
                          className="admin-danger-button"
                          disabled={deletingId === review._id}
                          onClick={() => deleteReview(review._id)}
                        >
                          {deletingId === review._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function PageHeader({ title, description, count }) {
  return (
    <header className="admin-page-header-row">
      <div>
        <span>Admin management</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <strong>{count}</strong>
    </header>
  );
}

function Messages({ message, error }) {
  return (
    <>
      {message && <div className="admin-alert success">{message}</div>}
      {error && <div className="admin-alert error">{error}</div>}
    </>
  );
}

function formatDate(date) {
  return date
    ? new Date(date).toLocaleDateString("en-IN")
    : "Not available";
}

export default AdminReviews;