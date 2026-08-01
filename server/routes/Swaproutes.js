const express = require("express");

const router = express.Router();

const {
  createSwapRequest,
  getSwapRequests,
  getUserSwapRequests,
  getSwapById,
  addNegotiationMessage,
  getNegotiationHistory,
  updateSwapStatus,
  acceptSwap,
  rejectSwap,
  cancelSwap,
  completeSwap,
} = require("../controllers/swapController");

// Create swap request
router.post(
  "/",
  createSwapRequest
);

// Get all swap requests
router.get(
  "/",
  getSwapRequests
);

// Get swap requests for one user
router.get(
  "/user/:id",
  getUserSwapRequests
);

// Get one swap request
router.get(
  "/:id",
  getSwapById
);

// Send negotiation message
router.post(
  "/:id/negotiate",
  addNegotiationMessage
);

// Get negotiation messages
router.get(
  "/:id/negotiation",
  getNegotiationHistory
);

// Accept swap
router.put(
  "/:id/accept",
  acceptSwap
);

// Reject swap
router.put(
  "/:id/reject",
  rejectSwap
);

// Cancel swap
router.put(
  "/:id/cancel",
  cancelSwap
);

// Complete swap
router.put(
  "/:id/complete",
  completeSwap
);

// General status update
router.put(
  "/:id",
  updateSwapStatus
);

module.exports = router;