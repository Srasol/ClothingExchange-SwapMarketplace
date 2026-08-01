import { useEffect, useState } from "react";
import API from "../services/api";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaUser,
  FaQuoteLeft,
} from "react-icons/fa";
import "./UserProfile.css";

function UserProfile() {
  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [user, setUser] = useState(
    loggedInUser || {}
  );
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] =
    useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      let updatedUser = loggedInUser;

      try {
        const profileResponse = await API.get(
          `/users/${loggedInUser._id}`
        );

        updatedUser =
          profileResponse.data.user ||
          profileResponse.data;
      } catch (profileError) {
        console.log(
          "Using local user information:",
          profileError
        );
      }

      setUser(updatedUser);

      const reviewResponse = await API.get(
        `/reviews/user/${loggedInUser._id}`
      );

      const reviewList =
        reviewResponse.data.reviews ||
        reviewResponse.data ||
        [];

      setReviews(reviewList);

      if (reviewList.length > 0) {
        const totalRating = reviewList.reduce(
          (total, review) =>
            total + Number(review.rating || 0),
          0
        );

        setAverageRating(
          totalRating / reviewList.length
        );
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      setUser(loggedInUser || {});
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={
          star <= Math.round(rating)
            ? "profile-star active-star"
            : "profile-star inactive-star"
        }
      />
    ));
  };

  const getInitial = () => {
    return user?.name
      ? user.name.charAt(0).toUpperCase()
      : "U";
  };

  if (loading) {
    return (
      <div className="profile-loading-page">
        <div className="profile-loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="modern-profile-page">
      <div className="profile-hero">
        <div className="profile-hero-overlay"></div>

        <div className="profile-hero-content">
          <div className="profile-avatar">
            {getInitial()}
          </div>

          <div className="profile-heading">
            <span className="profile-role">
              {user?.role || "User"}
            </span>

            <h1>{user?.name || "User Name"}</h1>

            <p>
              Welcome to your Clothing Exchange
              profile
            </p>
          </div>
        </div>
      </div>

      <div className="profile-main-container">
        <div className="profile-grid">
          {/* Left section */}
          <div className="profile-left-column">
            <div className="profile-card user-info-card">
              <div className="profile-card-title">
                <div className="title-icon">
                  <FaUser />
                </div>

                <div>
                  <h3>Personal Information</h3>
                  <p>Your account details</p>
                </div>
              </div>

              <div className="profile-info-list">
                <div className="profile-info-item">
                  <div className="profile-info-icon email-icon">
                    <FaEnvelope />
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>
                      {user?.email ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon phone-icon">
                    <FaPhoneAlt />
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <strong>
                      {user?.phone ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon location-icon">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>
                      {user?.location ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card trust-card">
              <div className="trust-icon">
                <FaStar />
              </div>

              <div>
                <h4>Trusted Swapper</h4>
                <p>
                  Ratings are provided by users after
                  successful clothing swaps.
                </p>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="profile-right-column">
            <div className="profile-stats-grid">
              <div className="stat-card rating-stat">
                <div className="stat-icon">
                  <FaStar />
                </div>

                <div>
                  <span>Average Rating</span>

                  <h2>
                    {averageRating.toFixed(1)}
                    <small>/5</small>
                  </h2>

                  <div className="profile-stars">
                    {renderStars(averageRating)}
                  </div>
                </div>
              </div>

              <div className="stat-card review-stat">
                <div className="review-count-circle">
                  {reviews.length}
                </div>

                <div>
                  <span>Total Reviews</span>
                  <h2>{reviews.length}</h2>
                  <p>Reviews received</p>
                </div>
              </div>
            </div>

            <div className="profile-card reviews-section">
              <div className="reviews-header">
                <div>
                  <h3>Reviews Received</h3>
                  <p>
                    Feedback from your completed swaps
                  </p>
                </div>

                <span className="review-badge">
                  {reviews.length} Reviews
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="empty-reviews">
                  <div className="empty-review-icon">
                    <FaQuoteLeft />
                  </div>

                  <h4>No reviews received yet</h4>

                  <p>
                    Complete a clothing swap to receive
                    your first review.
                  </p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div
                      className="modern-review-card"
                      key={review._id}
                    >
                      <div className="review-user-avatar">
                        {review.reviewer?.name
                          ? review.reviewer.name
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </div>

                      <div className="review-content">
                        <div className="review-top">
                          <div>
                            <h5>
                              {review.reviewer?.name ||
                                "Anonymous User"}
                            </h5>

                            <div className="profile-stars">
                              {renderStars(
                                review.rating
                              )}
                            </div>
                          </div>

                          <span className="review-date">
                            {review.createdAt
                              ? new Date(
                                  review.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : ""}
                          </span>
                        </div>

                        <div className="review-message">
                          <FaQuoteLeft />

                          <p>
                            {review.comment ||
                              "The user did not provide a written comment."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;