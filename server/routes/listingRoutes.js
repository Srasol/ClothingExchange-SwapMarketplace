const express = require("express");
const router = express.Router();

const upload = require(
  "../middleware/uploadMiddleware"
);

const protect = require(
  "../middleware/auth"
);

const listingController = require(
  "../controllers/ListingController"
);

// Temporary check
console.log({
  protectType: typeof protect,
  getMyListingsType:
    typeof listingController.getMyListings,
});

router.post(
  "/",
  protect,
  upload.single("image"),
  listingController.createListing
);

router.get(
  "/",
  listingController.getListings
);

// This must remain above /:id
router.get(
  "/my-listings",
  protect,
  listingController.getMyListings
);

router.get(
  "/:id",
  listingController.getListing
);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  listingController.updateListing
);

router.delete(
  "/:id",
  protect,
  listingController.deleteListing
);

module.exports = router;