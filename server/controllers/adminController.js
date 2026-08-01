const User = require("../models/User");
const Listing = require("../models/Listing");
const SwapRequest = require("../models/SwapRequest");
const Review = require("../models/Review");
/* =====================================================
   GET ADMIN DASHBOARD
   GET /api/admin/dashboard
===================================================== */

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalSwaps = await SwapRequest.countDocuments();

    const pendingSwaps = await SwapRequest.countDocuments({
      status: "Pending",
    });

    const acceptedSwaps = await SwapRequest.countDocuments({
      status: "Accepted",
    });

    const rejectedSwaps = await SwapRequest.countDocuments({
      status: "Rejected",
    });

    const completedSwaps = await SwapRequest.countDocuments({
      status: "Completed",
    });

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentListings = await Listing.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSwaps = await SwapRequest.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("offeredItem", "title image")
      .populate("requestedItem", "title image")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalListings,
        totalSwaps,
        pendingSwaps,
        acceptedSwaps,
        rejectedSwaps,
        completedSwaps,
      },
      recentUsers,
      recentListings,
      recentSwaps,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      message: "Failed to load admin dashboard.",
      error: error.message,
    });
  }
};

/* =====================================================
   GET ALL USERS
   GET /api/admin/users
===================================================== */

const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const role = req.query.role?.trim() || "";

    const filter = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (role && ["user", "admin"].includes(role.toLowerCase())) {
      filter.role = role.toLowerCase();
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Failed to load users.",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE USER ROLE
   PUT /api/admin/users/:id/role
===================================================== */

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        message: "Role is required.",
      });
    }

    const normalizedRole = role.toLowerCase();

    if (!["user", "admin"].includes(normalizedRole)) {
      return res.status(400).json({
        message: "Role must be either user or admin.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const loggedInAdminId =
      req.user?._id?.toString() ||
      req.user?.id?.toString() ||
      req.admin?._id?.toString() ||
      req.admin?.id?.toString();

    if (
      loggedInAdminId &&
      user._id.toString() === loggedInAdminId &&
      normalizedRole !== "admin"
    ) {
      return res.status(400).json({
        message: "You cannot remove your own admin role.",
      });
    }

    user.role = normalizedRole;
    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password"
    );

    return res.status(200).json({
      message: "User role updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      message: "Failed to update user role.",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE USER
   DELETE /api/admin/users/:id
===================================================== */

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const loggedInAdminId =
      req.user?._id?.toString() ||
      req.user?.id?.toString() ||
      req.admin?._id?.toString() ||
      req.admin?.id?.toString();

    if (
      loggedInAdminId &&
      user._id.toString() === loggedInAdminId
    ) {
      return res.status(400).json({
        message: "You cannot delete your own admin account.",
      });
    }

    await Listing.deleteMany({
      owner: user._id,
    });

    await SwapRequest.deleteMany({
      $or: [
        { sender: user._id },
        { receiver: user._id },
      ],
    });

    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      message: "User and related data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Failed to delete user.",
      error: error.message,
    });
  }
};
const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("owner", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get admin listings error:", error);

    return res.status(500).json({
      message: "Failed to load listings.",
      error: error.message,
    });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

    await SwapRequest.deleteMany({
      $or: [
        { offeredItem: listing._id },
        { requestedItem: listing._id },
      ],
    });

    await Listing.findByIdAndDelete(listing._id);

    return res.status(200).json({
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    console.error("Delete listing error:", error);

    return res.status(500).json({
      message: "Failed to delete listing.",
      error: error.message,
    });
  }
};
const getAllSwaps = async (req, res) => {
  try {
    const swaps = await SwapRequest.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("offeredItem", "title image")
      .populate("requestedItem", "title image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: swaps.length,
      swaps,
    });
  } catch (error) {
    console.error("Get swaps error:", error);

    return res.status(500).json({
      message: "Failed to load swaps.",
      error: error.message,
    });
  }
};

const updateSwapStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        message: "Swap request not found.",
      });
    }

    swap.status = status;

    switch (status) {
      case "Accepted":
        swap.acceptedAt = new Date();
        break;

      case "Rejected":
        swap.rejectedAt = new Date();
        break;

      case "Cancelled":
        swap.cancelledAt = new Date();
        break;

      case "Completed":
        swap.completedAt = new Date();
        break;
    }

    await swap.save();

    return res.status(200).json({
      message: "Swap status updated successfully.",
      swap,
    });
  } catch (error) {
    console.error("Update swap status error:", error);

    return res.status(500).json({
      message: "Failed to update swap.",
      error: error.message,
    });
  }
};

const deleteSwap = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        message: "Swap not found.",
      });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Swap deleted successfully.",
    });
  } catch (error) {
    console.error("Delete swap error:", error);

    return res.status(500).json({
      message: "Failed to delete swap.",
      error: error.message,
    });
  }
};
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("reviewer", "name email")
      .populate("reviewedUser", "name email")
      .populate("swap", "status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      message: "Failed to load reviews.",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      message: "Failed to delete review.",
      error: error.message,
    });
  }
};
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalListings = await Listing.countDocuments();

    const totalSwaps = await SwapRequest.countDocuments();

    const totalReviews = await Review.countDocuments();

    const pendingSwaps = await SwapRequest.countDocuments({
      status: "Pending",
    });

    const acceptedSwaps = await SwapRequest.countDocuments({
      status: "Accepted",
    });

    const rejectedSwaps = await SwapRequest.countDocuments({
      status: "Rejected",
    });

    const completedSwaps = await SwapRequest.countDocuments({
      status: "Completed",
    });

    const cancelledSwaps = await SwapRequest.countDocuments({
      status: "Cancelled",
    });

    const ratingResult = await Review.aggregate([
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
      ratingResult.length > 0
        ? Number(
            ratingResult[0].averageRating
          ).toFixed(1)
        : "0.0";

    return res.status(200).json({
      totalUsers,
      totalListings,
      totalSwaps,
      totalReviews,

      pendingSwaps,
      acceptedSwaps,
      rejectedSwaps,
      completedSwaps,
      cancelledSwaps,

      averageRating,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return res.status(500).json({
      message: "Failed to load analytics.",
      error: error.message,
    });
  }
};
module.exports = {
  getDashboardStats,

  getAllUsers,
  updateUserRole,
  deleteUser,

  getAllListings,
  deleteListing,

  getAllSwaps,
  updateSwapStatus,
  deleteSwap,

  getAllReviews,
  deleteReview,
   getAnalytics,
};