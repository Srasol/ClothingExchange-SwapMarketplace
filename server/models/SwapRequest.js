const mongoose = require("mongoose");

const negotiationSchema =
  new mongoose.Schema(
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: true,
    }
  );

const swapRequestSchema =
  new mongoose.Schema(
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      offeredItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
      },

      requestedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
      },

      message: {
        type: String,
        default: "",
        trim: true,
      },

      negotiation: [
        negotiationSchema,
      ],

      agreedValue: {
        type: Number,
        default: 0,
        min: 0,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Accepted",
          "Rejected",
          "Completed",
          "Cancelled",
        ],
        default: "Pending",
      },

      acceptedAt: {
        type: Date,
        default: null,
      },

      rejectedAt: {
        type: Date,
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "SwapRequest",
  swapRequestSchema
);