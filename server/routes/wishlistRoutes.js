const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/wishlistController");

const auth = require("../middleware/auth");

// Get logged-in user's wishlist
router.get("/", auth, getWishlist);

// Add item to wishlist
router.post("/:listingId", auth, addToWishlist);

// Remove item from wishlist
router.delete("/:listingId", auth, removeFromWishlist);

module.exports = router;