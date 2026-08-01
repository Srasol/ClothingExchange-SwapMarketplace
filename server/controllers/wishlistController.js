const Wishlist = require("../models/Wishlist");
const Listing = require("../models/Listing");

// ===============================
// Get Logged-in User Wishlist
// ===============================
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user.id,
    })
      .populate({
        path: "listing",
        populate: {
          path: "owner",
          select: "name email location",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Get Wishlist Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Add Item to Wishlist
// ===============================
exports.addToWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Check listing exists
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    // Already exists?
    const exists = await Wishlist.findOne({
      user: req.user.id,
      listing: listingId,
    });

    if (exists) {
      return res.status(400).json({
        message: "Item already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: req.user.id,
      listing: listingId,
    });

    const populatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate({
      path: "listing",
      populate: {
        path: "owner",
        select: "name email location",
      },
    });

    res.status(201).json({
      message: "Added to wishlist",
      wishlist: populatedWishlist,
    });
  } catch (error) {
    console.error("Add Wishlist Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Remove Item from Wishlist
// ===============================
exports.removeFromWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user.id,
      listing: listingId,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist item not found",
      });
    }

    await wishlist.deleteOne();

    res.status(200).json({
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Remove Wishlist Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};