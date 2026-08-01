const User = require("../models/User");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Listing = require("../models/Listing");

// ========================================
// Send Text, Image, Listing, or Reply
// ========================================
exports.sendMessage = async (req, res) => {
  try {
    const {
      sender,
      receiver,
      message,
      listingId,
      replyTo,
    } = req.body;

    const cleanMessage =
      typeof message === "string"
        ? message.trim()
        : "";

    const image = req.file
      ? `/uploads/chat/${req.file.filename}`
      : "";

    // Validate required user IDs
    if (!sender || !receiver) {
      return res.status(400).json({
        message:
          "Sender and receiver are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        sender
      ) ||
      !mongoose.Types.ObjectId.isValid(
        receiver
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid sender or receiver ID",
      });
    }

    if (String(sender) === String(receiver)) {
      return res.status(400).json({
        message:
          "You cannot send a message to yourself",
      });
    }

    // Confirm sender exists
    const senderUser =
      await User.findById(sender);

    if (!senderUser) {
      return res.status(404).json({
        message: "Sender not found",
      });
    }

    // Confirm receiver exists
    const receiverUser =
      await User.findById(receiver);

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    let sharedListing = null;

    // Validate shared listing
    if (listingId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          listingId
        )
      ) {
        return res.status(400).json({
          message: "Invalid listing ID",
        });
      }

      const listing =
        await Listing.findById(
          listingId
        );

      if (!listing) {
        return res.status(404).json({
          message: "Listing not found",
        });
      }

      sharedListing = listing._id;
    }

    let repliedMessage = null;

    // Validate reply message
    if (replyTo) {
      if (
        !mongoose.Types.ObjectId.isValid(
          replyTo
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid reply message ID",
        });
      }

      repliedMessage =
        await Message.findById(replyTo);

      if (!repliedMessage) {
        return res.status(404).json({
          message:
            "Replied message not found",
        });
      }

      const replySenderId = String(
        repliedMessage.sender
      );

      const replyReceiverId = String(
        repliedMessage.receiver
      );

      const belongsToConversation =
        (replySenderId ===
          String(sender) &&
          replyReceiverId ===
            String(receiver)) ||
        (replySenderId ===
          String(receiver) &&
          replyReceiverId ===
            String(sender));

      if (!belongsToConversation) {
        return res.status(400).json({
          message:
            "You can only reply to a message from this conversation",
        });
      }
    }

    // Message must contain text, image, or listing
    if (
      !cleanMessage &&
      !image &&
      !sharedListing
    ) {
      return res.status(400).json({
        message:
          "Message, image, or listing is required",
      });
    }

    // Save message
    const savedMessage =
      await Message.create({
        sender,
        receiver,
        message: cleanMessage,
        image,
        sharedListing,
        replyTo:
          repliedMessage?._id || null,
        reactions: [],
        isRead: false,
        readAt: null,
      });

    // Return populated message
    const populatedMessage =
      await Message.findById(
        savedMessage._id
      )
        .populate({
          path: "sender",
          select:
            "name email location",
        })
        .populate({
          path: "receiver",
          select:
            "name email location",
        })
        .populate({
          path: "sharedListing",
          select:
            "title category brand size condition description estimatedValue location image status owner",
          populate: {
            path: "owner",
            select:
              "name email location",
          },
        })
        .populate({
          path: "replyTo",
          select:
            "message image sender receiver sharedListing createdAt",
          populate: [
            {
              path: "sender",
              select:
                "name email location",
            },
            {
              path: "sharedListing",
              select:
                "title image estimatedValue location",
            },
          ],
        })
        .populate({
          path: "reactions.user",
          select: "name",
        });

    return res
      .status(201)
      .json(populatedMessage);
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to send message",
    });
  }
};

// ========================================
// Get Conversation Between Two Users
// ========================================
exports.getConversation = async (
  req,
  res
) => {
  try {
    const { sender, receiver } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        sender
      ) ||
      !mongoose.Types.ObjectId.isValid(
        receiver
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid sender or receiver ID",
      });
    }

    const messages =
      await Message.find({
        $or: [
          {
            sender,
            receiver,
          },
          {
            sender: receiver,
            receiver: sender,
          },
        ],
      })
        .populate({
          path: "sender",
          select:
            "name email location",
        })
        .populate({
          path: "receiver",
          select:
            "name email location",
        })
        .populate({
          path: "sharedListing",
          select:
            "title category brand size condition description estimatedValue location image status owner",
          populate: {
            path: "owner",
            select:
              "name email location",
          },
        })
        .populate({
          path: "replyTo",
          select:
            "message image sender receiver sharedListing createdAt",
          populate: [
            {
              path: "sender",
              select:
                "name email location",
            },
            {
              path: "sharedListing",
              select:
                "title image estimatedValue location",
            },
          ],
        })
        .populate({
          path: "reactions.user",
          select: "name",
        })
        .sort({
          createdAt: 1,
        });

    return res
      .status(200)
      .json(messages);
  } catch (error) {
    console.error(
      "Load conversation error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to load conversation",
    });
  }
};

// ========================================
// Get Unread Message Counts
// ========================================
exports.getUnreadCounts = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const unreadMessages =
      await Message.aggregate([
        {
          $match: {
            receiver:
              new mongoose.Types.ObjectId(
                userId
              ),
            isRead: false,
          },
        },
        {
          $group: {
            _id: "$sender",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const counts = {};

    unreadMessages.forEach(
      (item) => {
        counts[
          item._id.toString()
        ] = item.count;
      }
    );

    return res
      .status(200)
      .json(counts);
  } catch (error) {
    console.error(
      "Unread count error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to load unread counts",
    });
  }
};

// ========================================
// Mark Messages as Read
// ========================================
exports.markAsRead = async (
  req,
  res
) => {
  try {
    const { sender, receiver } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        sender
      ) ||
      !mongoose.Types.ObjectId.isValid(
        receiver
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid sender or receiver ID",
      });
    }

    const readTime = new Date();

    const result =
      await Message.updateMany(
        {
          sender,
          receiver,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: readTime,
          },
        }
      );

    return res.status(200).json({
      message:
        "Messages marked as read",
      modifiedCount:
        result.modifiedCount,
      readAt: readTime,
    });
  } catch (error) {
    console.error(
      "Mark messages as read error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to mark messages as read",
    });
  }
};

// ========================================
// Get Users for Chat Sidebar
// Latest Message + Newest First
// ========================================
exports.getChatUsers = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const users = await User.find({
      _id: {
        $ne: userId,
      },
      role: {
        $ne: "admin",
      },
    }).select(
      "name email location"
    );

    const usersWithLatestMessage =
      await Promise.all(
        users.map(async (user) => {
          const latestMessage =
            await Message.findOne({
              $or: [
                {
                  sender: userId,
                  receiver: user._id,
                },
                {
                  sender: user._id,
                  receiver: userId,
                },
              ],
            })
              .sort({
                createdAt: -1,
              })
              .populate({
                path: "sender",
                select: "name",
              })
              .populate({
                path: "receiver",
                select: "name",
              })
              .populate({
                path: "sharedListing",
                select:
                  "title image estimatedValue location",
              })
              .populate({
                path: "replyTo",
                select:
                  "message image sender createdAt",
                populate: {
                  path: "sender",
                  select: "name",
                },
              })
              .populate({
                path: "reactions.user",
                select: "name",
              });

          return {
            ...user.toObject(),
            latestMessage,
          };
        })
      );

    usersWithLatestMessage.sort(
      (a, b) => {
        if (
          !a.latestMessage &&
          !b.latestMessage
        ) {
          return (
            a.name || ""
          ).localeCompare(
            b.name || ""
          );
        }

        if (!a.latestMessage) {
          return 1;
        }

        if (!b.latestMessage) {
          return -1;
        }

        return (
          new Date(
            b.latestMessage.createdAt
          ) -
          new Date(
            a.latestMessage.createdAt
          )
        );
      }
    );

    return res
      .status(200)
      .json(
        usersWithLatestMessage
      );
  } catch (error) {
    console.error(
      "Get chat users error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to load chat users",
    });
  }
};

// ========================================
// Add, Change, or Remove Message Reaction
// ========================================
exports.toggleReaction = async (
  req,
  res
) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } =
      req.body;

    const allowedEmojis = [
      "👍",
      "❤️",
      "😂",
      "😮",
      "😢",
      "😡",
    ];

    if (!messageId) {
      return res.status(400).json({
        message:
          "Message ID is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        messageId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid message ID",
      });
    }

    if (!userId) {
      return res.status(400).json({
        message:
          "User ID is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (!emoji) {
      return res.status(400).json({
        message:
          "Reaction emoji is required",
      });
    }

    if (
      !allowedEmojis.includes(
        emoji
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid reaction emoji",
      });
    }

    const reactingUser =
      await User.findById(userId);

    if (!reactingUser) {
      return res.status(404).json({
        message:
          "Reacting user not found",
      });
    }

    const chatMessage =
      await Message.findById(
        messageId
      );

    if (!chatMessage) {
      return res.status(404).json({
        message:
          "Message not found",
      });
    }

    const senderId = String(
      chatMessage.sender
    );

    const receiverId = String(
      chatMessage.receiver
    );

    const reactingUserId =
      String(userId);

    // Only sender or receiver can react
    if (
      reactingUserId !== senderId &&
      reactingUserId !== receiverId
    ) {
      return res.status(403).json({
        message:
          "You cannot react to this message",
      });
    }

    // Support old messages that may not
    // contain a reactions array
    if (
      !Array.isArray(
        chatMessage.reactions
      )
    ) {
      chatMessage.reactions = [];
    }

    const reactionIndex =
      chatMessage.reactions.findIndex(
        (reaction) =>
          String(reaction.user) ===
          reactingUserId
      );

    if (reactionIndex !== -1) {
      const existingReaction =
        chatMessage.reactions[
          reactionIndex
        ];

      // Same reaction clicked:
      // remove the reaction
      if (
        existingReaction.emoji ===
        emoji
      ) {
        chatMessage.reactions.splice(
          reactionIndex,
          1
        );
      } else {
        // Different emoji clicked:
        // update the reaction
        existingReaction.emoji =
          emoji;
      }
    } else {
      // Add new reaction
      chatMessage.reactions.push({
        user: userId,
        emoji,
      });
    }

    await chatMessage.save();

    const updatedMessage =
      await Message.findById(
        messageId
      )
        .populate({
          path: "sender",
          select:
            "name email location",
        })
        .populate({
          path: "receiver",
          select:
            "name email location",
        })
        .populate({
          path: "sharedListing",
          select:
            "title category brand size condition description estimatedValue location image status owner",
          populate: {
            path: "owner",
            select:
              "name email location",
          },
        })
        .populate({
          path: "replyTo",
          select:
            "message image sender receiver sharedListing createdAt",
          populate: [
            {
              path: "sender",
              select:
                "name email location",
            },
            {
              path: "sharedListing",
              select:
                "title image estimatedValue location",
            },
          ],
        })
        .populate({
          path: "reactions.user",
          select: "name",
        });

    return res
      .status(200)
      .json(updatedMessage);
  } catch (error) {
    console.error(
      "Toggle reaction error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to update reaction",
    });
  }
};