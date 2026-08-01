const User = require("../models/User");
const Listing = require("../models/Listing");
const SwapRequest = require("../models/SwapRequest");
const Review = require("../models/Review");

const getReports = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalListings = await Listing.countDocuments();

    const totalSwaps = await SwapRequest.countDocuments();

    const totalReviews = await Review.countDocuments();

    const listingsByCategory = await Listing.aggregate([
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const swapsByStatus = await SwapRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const averageRatingResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    const averageRating =
      averageRatingResult.length > 0
        ? Number(
            averageRatingResult[0].averageRating
          ).toFixed(1)
        : "0.0";

    return res.status(200).json({
      totals: {
        totalUsers,
        totalListings,
        totalSwaps,
        totalReviews,
        averageRating,
      },
      listingsByCategory,
      swapsByStatus,
    });
  } catch (error) {
    console.error("Admin reports error:", error);

    return res.status(500).json({
      message: "Failed to load admin reports.",
      error: error.message,
    });
  }
};

module.exports = {
  getReports,
};