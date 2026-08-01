const express = require("express");

const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
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
} = require("../controllers/adminController");
/* Admin dashboard */

router.get(
  "/dashboard",
  adminAuth,
  getDashboardStats
);

/* Admin users management */

router.get(
  "/users",
  adminAuth,
  getAllUsers
);

router.put(
  "/users/:id/role",
  adminAuth,
  updateUserRole
);

router.delete(
  "/users/:id",
  adminAuth,
  deleteUser
);
router.get(
  "/listings",
  adminAuth,
  getAllListings
);

router.delete(
  "/listings/:id",
  adminAuth,
  deleteListing
);
router.get(
  "/swaps",
  adminAuth,
  getAllSwaps
);

router.put(
  "/swaps/:id/status",
  adminAuth,
  updateSwapStatus
);

router.delete(
  "/swaps/:id",
  adminAuth,
  deleteSwap
);
router.get(
  "/reviews",
  adminAuth,
  getAllReviews
);

router.delete(
  "/reviews/:id",
  adminAuth,
  deleteReview
);
router.get(
  "/analytics",
  adminAuth,
  getAnalytics
);

module.exports = router;