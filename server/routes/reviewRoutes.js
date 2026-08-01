const express = require("express");

const router = express.Router();

const {
  createReview,
  getUserReviews,
  getAllReviews,
  deleteReview,
} = require("../controllers/reviewController");

// Create a review
router.post("/", createReview);

// Get reviews of one user
router.get("/user/:userId", getUserReviews);

// Get all reviews (Admin)
router.get("/", getAllReviews);

// Delete review
router.delete("/:id", deleteReview);

module.exports = router;