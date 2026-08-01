const mongoose = require("mongoose");
const SwapRequest = require("../models/SwapRequest");

// Reusable populate settings
const populateSwap = (query) =>
  query
    .populate("sender", "name email location")
    .populate("receiver", "name email location")
    .populate(
      "offeredItem",
      "title image brand size condition estimatedValue location status"
    )
    .populate(
      "requestedItem",
      "title image brand size condition estimatedValue location status"
    )
    .populate(
      "negotiation.sender",
      "name email"
    );

// ========================================
// Create Swap Request
// ========================================
exports.createSwapRequest = async (
  req,
  res
) => {
  try {
    const {
      sender,
      receiver,
      offeredItem,
      requestedItem,
      message,
    } = req.body;

    if (
      !sender ||
      !receiver ||
      !offeredItem ||
      !requestedItem
    ) {
      return res.status(400).json({
        message:
          "Sender, receiver, offered item and requested item are required",
      });
    }

    const ids = [
      sender,
      receiver,
      offeredItem,
      requestedItem,
    ];

    const invalidId = ids.some(
      (id) =>
        !mongoose.Types.ObjectId.isValid(
          id
        )
    );

    if (invalidId) {
      return res.status(400).json({
        message:
          "One or more IDs are invalid",
      });
    }

    if (
      String(sender) ===
      String(receiver)
    ) {
      return res.status(400).json({
        message:
          "You cannot send a swap request to yourself",
      });
    }

    const existingSwap =
      await SwapRequest.findOne({
        sender,
        receiver,
        offeredItem,
        requestedItem,
        status: "Pending",
      });

    if (existingSwap) {
      return res.status(400).json({
        message:
          "A pending swap request already exists",
      });
    }

    const swap =
      await SwapRequest.create({
        sender,
        receiver,
        offeredItem,
        requestedItem,
        message:
          message?.trim() || "",
      });

    const populatedSwap =
      await populateSwap(
        SwapRequest.findById(
          swap._id
        )
      );

    res.status(201).json({
      message:
        "Swap request created successfully",
      swap: populatedSwap,
    });
  } catch (error) {
    console.error(
      "Create swap error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to create swap request",
    });
  }
};

// ========================================
// Get All Swap Requests — Admin
// ========================================
exports.getSwapRequests = async (
  req,
  res
) => {
  try {
    const swaps =
      await populateSwap(
        SwapRequest.find().sort({
          createdAt: -1,
        })
      );

    res.status(200).json(swaps);
  } catch (error) {
    console.error(
      "Get swaps error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to load swap requests",
    });
  }
};

// ========================================
// Get User Swap Requests
// ========================================
exports.getUserSwapRequests =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const swaps =
        await populateSwap(
          SwapRequest.find({
            $or: [
              {
                sender: id,
              },
              {
                receiver: id,
              },
            ],
          }).sort({
            createdAt: -1,
          })
        );

      res.status(200).json(swaps);
    } catch (error) {
      console.error(
        "Get user swaps error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to load user swap requests",
      });
    }
  };

// ========================================
// Get One Swap Request
// ========================================
exports.getSwapById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message: "Invalid swap ID",
      });
    }

    const swap =
      await populateSwap(
        SwapRequest.findById(id)
      );

    if (!swap) {
      return res.status(404).json({
        message:
          "Swap request not found",
      });
    }

    res.status(200).json(swap);
  } catch (error) {
    console.error(
      "Get swap error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to load swap request",
    });
  }
};

// ========================================
// Add Negotiation Message
// POST /api/swaps/:id/negotiate
// ========================================
exports.addNegotiationMessage =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { sender, message } =
        req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message: "Invalid swap ID",
        });
      }

      if (
        !sender ||
        !mongoose.Types.ObjectId.isValid(
          sender
        )
      ) {
        return res.status(400).json({
          message:
            "A valid sender ID is required",
        });
      }

      const cleanMessage =
        message?.trim();

      if (!cleanMessage) {
        return res.status(400).json({
          message:
            "Negotiation message is required",
        });
      }

      const swap =
        await SwapRequest.findById(id);

      if (!swap) {
        return res.status(404).json({
          message:
            "Swap request not found",
        });
      }

      const isParticipant =
        String(swap.sender) ===
          String(sender) ||
        String(swap.receiver) ===
          String(sender);

      if (!isParticipant) {
        return res.status(403).json({
          message:
            "Only swap participants can negotiate",
        });
      }

      if (
        swap.status !== "Pending"
      ) {
        return res.status(400).json({
          message:
            "Negotiation is only allowed while the swap is pending",
        });
      }

      swap.negotiation.push({
        sender,
        message: cleanMessage,
      });

      await swap.save();

      const populatedSwap =
        await populateSwap(
          SwapRequest.findById(
            swap._id
          )
        );

      const latestMessage =
        populatedSwap.negotiation[
          populatedSwap.negotiation
            .length - 1
        ];

      res.status(201).json({
        message:
          "Negotiation message added",
        negotiationMessage:
          latestMessage,
        swap: populatedSwap,
      });
    } catch (error) {
      console.error(
        "Add negotiation error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to add negotiation message",
      });
    }
  };

// ========================================
// Get Negotiation History
// GET /api/swaps/:id/negotiation
// ========================================
exports.getNegotiationHistory =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message: "Invalid swap ID",
        });
      }

      const swap =
        await SwapRequest.findById(
          id
        )
          .select(
            "sender receiver negotiation status"
          )
          .populate(
            "negotiation.sender",
            "name email"
          );

      if (!swap) {
        return res.status(404).json({
          message:
            "Swap request not found",
        });
      }

      res.status(200).json({
        status: swap.status,
        negotiation:
          swap.negotiation,
      });
    } catch (error) {
      console.error(
        "Get negotiation error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to load negotiation history",
      });
    }
  };

// ========================================
// Update Swap Status
// Existing general endpoint
// ========================================
exports.updateSwapStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Accepted",
        "Rejected",
        "Completed",
        "Cancelled",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid swap status",
        });
      }

      const swap =
        await SwapRequest.findById(id);

      if (!swap) {
        return res.status(404).json({
          message:
            "Swap request not found",
        });
      }

      swap.status = status;

      if (status === "Accepted") {
        swap.acceptedAt =
          new Date();
      }

      if (status === "Rejected") {
        swap.rejectedAt =
          new Date();
      }

      if (status === "Cancelled") {
        swap.cancelledAt =
          new Date();
      }

      if (status === "Completed") {
        swap.completedAt =
          new Date();
      }

      await swap.save();

      const populatedSwap =
        await populateSwap(
          SwapRequest.findById(
            swap._id
          )
        );

      res.status(200).json({
        message:
          "Swap status updated",
        swap: populatedSwap,
      });
    } catch (error) {
      console.error(
        "Update swap status error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to update swap status",
      });
    }
  };

// ========================================
// Accept Swap
// ========================================
exports.acceptSwap = async (
  req,
  res
) => {
  try {
    const swap =
      await SwapRequest.findById(
        req.params.id
      );

    if (!swap) {
      return res.status(404).json({
        message:
          "Swap request not found",
      });
    }

    if (
      swap.status !== "Pending"
    ) {
      return res.status(400).json({
        message:
          "Only pending swaps can be accepted",
      });
    }

    swap.status = "Accepted";
    swap.acceptedAt = new Date();

    await swap.save();

    const populatedSwap =
      await populateSwap(
        SwapRequest.findById(
          swap._id
        )
      );

    res.status(200).json({
      message:
        "Swap accepted successfully",
      swap: populatedSwap,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message ||
        "Failed to accept swap",
    });
  }
};

// ========================================
// Reject Swap
// ========================================
exports.rejectSwap = async (
  req,
  res
) => {
  try {
    const swap =
      await SwapRequest.findById(
        req.params.id
      );

    if (!swap) {
      return res.status(404).json({
        message:
          "Swap request not found",
      });
    }

    if (
      swap.status !== "Pending"
    ) {
      return res.status(400).json({
        message:
          "Only pending swaps can be rejected",
      });
    }

    swap.status = "Rejected";
    swap.rejectedAt = new Date();

    await swap.save();

    const populatedSwap =
      await populateSwap(
        SwapRequest.findById(
          swap._id
        )
      );

    res.status(200).json({
      message:
        "Swap rejected successfully",
      swap: populatedSwap,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message ||
        "Failed to reject swap",
    });
  }
};

// ========================================
// Cancel Swap
// ========================================
exports.cancelSwap = async (
  req,
  res
) => {
  try {
    const swap =
      await SwapRequest.findById(
        req.params.id
      );

    if (!swap) {
      return res.status(404).json({
        message:
          "Swap request not found",
      });
    }

    if (
      swap.status !== "Pending"
    ) {
      return res.status(400).json({
        message:
          "Only pending swaps can be cancelled",
      });
    }

    swap.status = "Cancelled";
    swap.cancelledAt = new Date();

    await swap.save();

    const populatedSwap =
      await populateSwap(
        SwapRequest.findById(
          swap._id
        )
      );

    res.status(200).json({
      message:
        "Swap cancelled successfully",
      swap: populatedSwap,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message ||
        "Failed to cancel swap",
    });
  }
};

// ========================================
// Complete Swap
// ========================================
exports.completeSwap = async (
  req,
  res
) => {
  try {
    const swap =
      await SwapRequest.findById(
        req.params.id
      );

    if (!swap) {
      return res.status(404).json({
        message:
          "Swap request not found",
      });
    }

    if (
      swap.status !== "Accepted"
    ) {
      return res.status(400).json({
        message:
          "Only accepted swaps can be completed",
      });
    }

    swap.status = "Completed";
    swap.completedAt = new Date();

    await swap.save();

    const populatedSwap =
      await populateSwap(
        SwapRequest.findById(
          swap._id
        )
      );

    res.status(200).json({
      message:
        "Swap completed successfully",
      swap: populatedSwap,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message ||
        "Failed to complete swap",
    });
  }
};