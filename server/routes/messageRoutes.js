const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");

const {
  sendMessage,
  getConversation,
  getUnreadCounts,
  markAsRead,
} = require("../controllers/messageController");

const router = express.Router();

const uploadFolder = path.join(
  __dirname,
  "../uploads/chat"
);

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Send message
router.post(
  "/",
  upload.single("image"),
  sendMessage
);

// Get all users except logged-in user
router.get(
  "/users/:currentUserId",
  async (req, res) => {
    try {
      const currentUserId =
        req.params.currentUserId;

      const users = await User.find({
        _id: {
          $ne: currentUserId,
        },
      }).select(
        "_id name email location role"
      );

      console.log(
        "Chat users found:",
        users.length
      );

      res.status(200).json(users);
    } catch (error) {
      console.error(
        "Get chat users error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load chat users",
        error: error.message,
      });
    }
  }
);

// Get unread message counts
router.get(
  "/unread/:userId",
  getUnreadCounts
);

// Mark messages as read
router.put(
  "/read/:sender/:receiver",
  markAsRead
);

// Get conversation
router.get(
  "/:sender/:receiver",
  getConversation
);

module.exports = router;