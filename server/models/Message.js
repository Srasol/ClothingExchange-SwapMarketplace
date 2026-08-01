const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    emoji: {
      type: String,
      enum: ["👍", "❤️", "😂", "😮", "😢", "😡"],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: [
        3000,
        "Message cannot exceed 3000 characters",
      ],
      default: "",
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    sharedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    reactions: {
      type: [reactionSchema],
      default: [],
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// A message must contain text, an image,
// or a shared listing.
messageSchema.pre("validate", function () {
  const hasText =
    typeof this.message === "string" &&
    this.message.trim().length > 0;

  const hasImage =
    typeof this.image === "string" &&
    this.image.trim().length > 0;

  const hasSharedListing =
    Boolean(this.sharedListing);

  if (
    !hasText &&
    !hasImage &&
    !hasSharedListing
  ) {
    this.invalidate(
      "message",
      "Message text, image, or shared listing is required"
    );
  }
});

// Speeds up loading a conversation
// between two users.
messageSchema.index({
  sender: 1,
  receiver: 1,
  createdAt: 1,
});

// Speeds up unread-message queries.
messageSchema.index({
  receiver: 1,
  sender: 1,
  isRead: 1,
});

// Speeds up recent-message queries.
messageSchema.index({
  sender: 1,
  createdAt: -1,
});

messageSchema.index({
  receiver: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Message",
  messageSchema
);