const Review = require("../models/Review");
const SwapRequest = require("../models/SwapRequest");

// Create a review
const createReview = async (req, res) => {
  try {
    const {
      reviewer,
      swap,
      rating,
      title,
      comment,
    } = req.body;

    if (
      !reviewer ||
      !swap ||
      !rating ||
      !comment
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const numericRating = Number(rating);

    if (
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const swapRequest =
      await SwapRequest.findById(swap);

    if (!swapRequest) {
      return res.status(404).json({
        message: "Swap request not found",
      });
    }

    if (swapRequest.status !== "Completed") {
      return res.status(400).json({
        message:
          "You can review only completed swaps",
      });
    }

    const reviewerId = String(reviewer);
    const senderId = String(
      swapRequest.sender
    );
    const receiverId = String(
      swapRequest.receiver
    );

    const reviewerIsSender =
      reviewerId === senderId;

    const reviewerIsReceiver =
      reviewerId === receiverId;

    if (
      !reviewerIsSender &&
      !reviewerIsReceiver
    ) {
      return res.status(403).json({
        message:
          "You are not part of this swap",
      });
    }

    const reviewedUser = reviewerIsSender
      ? swapRequest.receiver
      : swapRequest.sender;

    const existingReview =
      await Review.findOne({
        reviewer,
        swap,
      });

    if (existingReview) {
      return res.status(400).json({
        message:
          "You already reviewed this swap",
      });
    }

    const review = await Review.create({
      reviewer,
      reviewedUser,
      swap,
      rating: numericRating,
      title: title?.trim() || "",
      comment: comment.trim(),
    });

    const populatedReview =
      await Review.findById(review._id)
        .populate(
          "reviewer",
          "name email"
        )
        .populate(
          "reviewedUser",
          "name email"
        );

    return res.status(201).json({
      message:
        "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error(
      "Create review error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating review",
      error: error.message,
    });
  }
};

// Get reviews received by one user
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewedUser: req.params.userId,
    })
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce(
            (total, review) => total + review.rating,
            0
          ) / totalReviews
        : 0;

    return res.status(200).json({
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      message: "Server error while getting reviews",
      error: error.message,
    });
  }
};

// Get every review for admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("reviewer", "name email")
      .populate("reviewedUser", "name email")
      .populate("swap")
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Get all reviews error:", error);

    return res.status(500).json({
      message: "Server error while getting reviews",
      error: error.message,
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      message: "Server error while deleting review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getAllReviews,
  deleteReview,
};